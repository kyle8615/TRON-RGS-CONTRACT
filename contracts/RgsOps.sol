pragma solidity ^0.5.2;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../contracts/AdministratorOwnable.sol";

// Chain is a contract that sends and recieves tokens

interface IERC20Burnable {
  function burn(uint256 amount) external returns (bool);
  function burnFrom(address account, uint256 amount) external returns (bool);
}

contract RgsOps is AdministratorOwnable {
  // Library
  using SafeMath for uint256;

  uint redeemableTime = 60;

  // States

  // Beneficiary address is the address that the remaining tokens will be
  // transferred to for selfdestruct.
  address payable public beneficiary;

  // stakeTokenAddress is an address that allow to stake.
  address public stakeTokenAddress;

  // burnTokenAddress is an address that allow to burn.
  address public burnTokenAddress;

  // totalStakeAmount is total stake amount.
  uint256 public totalStakeAmount;

  // stakedAddresses stores the tokens that are staked on this contract.
  address[] public stakedAddresses;

  // registeredTokens stores the tokens that are registed on this contract.
  address[] public registeredTokens;

  // stakeBurnAddresses stores the address that operate stakeburn on this contract.
  address[] public stakeBurnAddresses;

  // registeredTokenMap is an address mapping that stores the currencies.
  // Note that the zero address 0x0 represents the native token in this mapping.
  //
  // mapping structure
  //    main currency address
  // -> existence
  mapping (address => bool) public registeredTokenMap;

  // minTokenValue records the minimum allowed value for each currency.
  //
  // mapping structure
  //    currency address
  // -> minimum accepted value
  mapping (address => uint256) public minTokenValue;

  // stakeMap is mapping of account to stake amount.
  // mapping structure
  //    account address
  // -> amount
  mapping (address => uint256) public stakeMap;

  struct UnstakeRecord {
    uint256 amount;
    uint timestamp;
  }

  // unstakeMap is mapping of account to unstake record.
  // mapping structure
  //    account address
  // -> unstake record
  mapping (address => UnstakeRecord[]) public unstakeMap;

  struct StakeBurnRecord {
    uint256 amount;
    uint timestamp;
  }

  // burnMap is mapping of accoount to burn records.
  // mapping structure
  //    account address
  // -> burn records
  mapping (address => StakeBurnRecord[]) public stakeBurnMap;

  // Events

  // A Deposit event is emitted when a user deposits native currency or tokens
  // with value into the Chain contract.
  event Deposit(
    address indexed token,      // the source token address
    address indexed addr,       // address who deposit to this contract.
    uint256 value               // value to deposit.
  );

  // A Withdraw event is emitted when a user sends withdrawal transaction
  // to withdraw native currency or token with value to the address.
  event Withdraw(
    address indexed token,      // the source token address.
    address indexed addr,       // address to withdraw to.
    uint256 value               // value to withdraw.
  );

  // A RegisterToken event is emitted when the administrator registers a currency.
  // Note that
  //   - the zero address 0x0 of token represents the native currency
  event RegisterToken(
    address indexed token,           // token address.
    uint256 minValue                 // minimum value to deposit and withdraw.
  );

    // A UnregisterToken event is emitted when the administrator unregisters a currency.
  // Note that
  //   - the zero address 0x0 of token represents the native currency
  event UnregisterToken(
    address indexed token           // token address.
  );

  // A SetStakeToken event is emitted when the administrator enable stake this currency.
  event SetStakeToken(
    address indexed token           // token address.
  );

  // A SetBurnToken event is emitted when the administrator enable burn this currency.
  event SetBurnToken(
    address indexed token           // token address.
  );

  // A Stake event is emitted when a user stakes tokens
  // with value into the Chain contract.
  event Stake(
    address indexed token,      // the source token address
    address indexed addr,       // address to stake to.
    uint256 value,              // value to stake.
    uint256 staked             // staked value.
  );

  // A Unstake event is emitted when a user sends unstake transaction
  // to unstake token with value to the address.
  event Unstake(
    address indexed token,      // the source token address.
    address indexed addr,       // address to unstake to.
    uint256 value,              // value to unstake.
    uint256 staked             // staked value.
  );

  // A Redeem event is emitted when called unstake passthrough 86400 blocktime,
  // then user can call redeem to get token back.
  event Redeem(
    address indexed token,      // the source token address.
    address indexed addr,       // address to redeem to.
    uint256 value               // the redeem value.
  );

  // A StakeBurn event is emitted when called StakeBurn function.
  event StakeBurn(
    address indexed token,      // the source token address.
    address indexed addr,       // address to stake burn to.
    uint256 value               // the stake burn value.
  );

  event Burn(
    address indexed addr,       // address to burn token.
    uint cutoff,                // the timestamp to burn.
    uint256 value               // the burn value.
  );

  constructor(address payable admin_beneficiary) public {
    beneficiary = admin_beneficiary;
  }

  function destruct() public onlyAdministrator {
    // transfer all tokens to beneficiary.
    for (uint i=0; i<registeredTokens.length; i++) {
      IERC20 token = IERC20(registeredTokens[i]);
      uint256 balance = token.balanceOf(address(this));
      if (balance > 0 && registeredTokens[i] != address(0)) {
          token.transfer(beneficiary, balance);
      }
    }

    selfdestruct(beneficiary);
  }

  modifier registered(address token) {
    require(registeredTokenMap[token], 'unregistered token');
    _;
  }

  modifier validAmount(address token, uint256 value) {
    require(value >= minTokenValue[token], "value less than min amount");
    _;
  }

  modifier stakable() {
    require(address(stakeTokenAddress) != address(0), 'not set stake token');
    _;
  }

  modifier burnable() {
    require(address(burnTokenAddress) != address(0), 'not set burn token');
    _;
  }

  // Caller needs to send at least min value native token when called (payable).
  // A Deposit event will be emitted for the foundation server to mint the
  // corresponding wrapped tokens to the dest_addr on the destination chain.
  //
  // value: The value to mint.
  function depositNative()
    payable
    public
    whenNotPaused
    registered(address(0))
    validAmount(address(0), msg.value)
  {
    emit Deposit(address(0), msg.sender, msg.value);
  }

  function () payable external {
    revert('not allowed to send value');
  }

  // A Deposit event will be used to verify transaction works.
  //
  // token_addr: The token to deposit with.
  // value: The value to send.
  function depositToken(
    address token_addr,
    uint256 value
  )
    public
    whenNotPaused
    registered(token_addr)
    validAmount(token_addr, value)
  {
    emit Deposit(token_addr, msg.sender, value);
    IERC20 token = IERC20(token_addr);
    require(token.transferFrom(msg.sender, address(this), value));
  }

  // addr: The address to withdraw to.
  // value: The value to withdraw.
  function withdrawNative(
    address payable addr,
    uint256 value
  )
    public
    whenNotPaused
    onlyAdministrator
    registered(address(0))
    validAmount(address(0), value)
  {
    emit Withdraw(address(0), addr, value);
    addr.transfer(value);
  }

  // token_addr: The address of the token to withdraw.
  // addr: The address to withdraw.
  // value: The value to withdraw.
  function withdrawToken(
    address token_addr,
    address addr,
    uint256 value
  )
    public
    whenNotPaused
    onlyAdministrator
    registered(token_addr)
    validAmount(token_addr, value)
  {
    emit Withdraw(token_addr, addr, value);

    IERC20 token = IERC20(token_addr);
    require(token.transfer(addr, value));
  }

  /**
   * @dev registerToken for enable deposit and withdraw function,
   *
   * @param token_addr The address of the token.
   * @param minValue The minimum amount of each deposit/withdraw can transfer with.
   */
  function registerToken(
    address token_addr,
    uint256 minValue
  )
    public
    whenNotPaused
    onlyAdministrator
  {
    // require(!registeredTokenMap[main_token], 'already registered');

    emit RegisterToken(token_addr, minValue);

    registeredTokenMap[token_addr] = true;
    minTokenValue[token_addr] = minValue;

    registeredTokens.push(token_addr);
  }

  /**
  * @dev unregisterToken token for disable deposit and withdraw function,
  *
  * @param token_addr The address of the token.
  */
  function unregisterToken(
    address token_addr
  )
    public
    whenNotPaused
    onlyAdministrator
  {
    require(registeredTokenMap[token_addr]  == true , 'not registered');

    emit UnregisterToken(token_addr);

    delete registeredTokenMap[token_addr];
    delete minTokenValue[token_addr];

        for(uint i = 0; i < registeredTokens.length - 1; i++) {
            if(registeredTokens[i] == token_addr) {
                registeredTokens[i] = registeredTokens[registeredTokens.length - 1];
                break;
            }
        }
        delete registeredTokens[registeredTokens.length - 1];
        registeredTokens.length--;
  }

  /**
   * @dev setStakeToken for enable stake/unstake function,
   *
   * @param token_addr The address of the token.
   */
  function setStakeToken(
    address token_addr
  )
    public
    whenNotPaused
    onlyAdministrator
  {
    require(token_addr != address(0), 'invalid address');
    stakeTokenAddress = token_addr;
    emit SetStakeToken(token_addr);
  }

  /**
   * @dev setBurnToken for enable stakeBurn function,
   *
   * @param token_addr The address of the token.
   */
  function setBurnToken(
    address token_addr
  )
    public
    whenNotPaused
    onlyAdministrator
  {
    require(token_addr != address(0), 'invalid address');
    burnTokenAddress = token_addr;
    emit SetBurnToken(token_addr);
  }

  /**
  * @dev stakeToken for stake token in to contract, should call the token
  * contract approve function for allow contract to transfer token.
  *
  * @param value The stake amount of the token.
  */
  function stakeToken(
    uint256 value
  )
    public
    whenNotPaused
    stakable
  {
    IERC20 token = IERC20(stakeTokenAddress);
    require(token.transferFrom(msg.sender, address(this), value));
    if(stakeMap[msg.sender] == 0) {
      stakedAddresses.push(msg.sender);
    }
    stakeMap[msg.sender] = stakeMap[msg.sender].add(value);
    totalStakeAmount = totalStakeAmount.add(value);
    emit Stake(stakeTokenAddress, msg.sender, value, stakeMap[msg.sender]);
  }

  /**
  * @dev unstakeToken for unlock token, token will be able to redeem after 86400
  * block timestamp.
  *
  * @param value The stake amount of the token.
  */
  function unstakeToken(
    uint256 value
  )
    public
    whenNotPaused
    stakable
  {
    stakeMap[msg.sender] = stakeMap[msg.sender].sub(value);
    if(stakeMap[msg.sender] == 0 ) {
      delete stakeMap[msg.sender];
      uint len = stakedAddresses.length;
      for (uint i = 0; i < len - 1; i++){
        if(stakedAddresses[i] ==  msg.sender) {
          stakedAddresses[i] = stakedAddresses[len-1];
        }
      }
      delete stakedAddresses[len-1];
      stakedAddresses.length--;
    }
    totalStakeAmount = totalStakeAmount.sub(value);
    UnstakeRecord memory record = UnstakeRecord(value, now);
    unstakeMap[msg.sender].push(record);
    emit Unstake(stakeTokenAddress, msg.sender, value, stakeMap[msg.sender]);
  }

  /**
  * @dev redeemToken for get back the token, called unstakeToken function and pass
  * through 86400 block time can be called.
  */
  function redeemToken()
    public
    whenNotPaused
    stakable
  {
    require(unstakeMap[msg.sender][0].timestamp < now - redeemableTime);
    IERC20 token = IERC20(stakeTokenAddress);
    require(token.transfer(msg.sender, unstakeMap[msg.sender][0].amount));
    emit Redeem(stakeTokenAddress, msg.sender, unstakeMap[msg.sender][0].amount);

    uint len = unstakeMap[msg.sender].length;
    for (uint i = 0; i < len - 1; i++){
      unstakeMap[msg.sender][i] = unstakeMap[msg.sender][i+1];
    }
    delete unstakeMap[msg.sender][len-1];
    unstakeMap[msg.sender].length--;

    if(unstakeMap[msg.sender].length == 0) {
      delete unstakeMap[msg.sender];
    }
  }

  /**
  * @dev redeemableTokenOf for check unstaked token, can use this function for
  * pass unstake called timestamp.
  */
  function redeemableTokenOf()
    whenNotPaused
    stakable
    external view returns (uint256[] memory, uint[] memory)
  {

    uint len = unstakeMap[msg.sender].length;
    uint256[] memory _amounts = new uint256[](len);
    uint[] memory _timestamps = new uint[](len);
    for (uint i = 0; i < len; i++){
      UnstakeRecord memory record = unstakeMap[msg.sender][i];
       _amounts[i] = record.amount;
       _timestamps[i] = record.timestamp;
    }
    return (_amounts, _timestamps);
  }

  /**
  * @dev stakeBurnToken for set token in to a wait for burn status, then system
  * will execute token burn at the condition fulfilled.
  *
  * @param value The stake amount of the token.
  */
  function stakeBurnToken(
    uint256 value
  )
    public
    whenNotPaused
    burnable
  {
    IERC20 token = IERC20(burnTokenAddress);
    require(token.transferFrom(msg.sender, address(this), value));
    StakeBurnRecord memory record =  StakeBurnRecord(value, now);
    addStakeBurnRcord(msg.sender, record);

    emit StakeBurn(burnTokenAddress, msg.sender, value);
  }

  function stakeBurnRecordOf(
    address addr
  )
    public
    whenNotPaused
    burnable
    view returns (uint256[] memory, uint[] memory)
  {
    uint len = stakeBurnMap[addr].length;
    uint256[] memory _amounts = new uint256[](len);
    uint[] memory _timestamps = new uint[](len);
    for (uint i = 0; i < len; i++){
      StakeBurnRecord memory record = stakeBurnMap[addr][i];
      _amounts[i] = record.amount;
      _timestamps[i] = record.timestamp;
    }
    return (_amounts, _timestamps);
  }

  function burnRecordByAddr(
    address addr,
    uint cutoff
  )
    public
    whenNotPaused
    onlyAdministrator
    burnable
  {
    uint _len = stakeBurnMap[addr].length;
    uint256 _burnAmount;
    uint _deleteCount = 0;
    uint _emptyIndex = 0;

    require(_len > 0);
    for (uint i = 0; i < _len; i++){
      StakeBurnRecord memory record = stakeBurnMap[addr][i];
      if(record.timestamp <= cutoff ) {
        _burnAmount = _burnAmount.add(record.amount);
        delete stakeBurnMap[addr][i];
        _deleteCount++;
      } else {
        if(stakeBurnMap[addr][_emptyIndex].timestamp == 0){
          stakeBurnMap[addr][_emptyIndex] = record;
          _emptyIndex++;
          delete stakeBurnMap[addr][i];
        }
      }
    }

    for (uint i = 0; i < _deleteCount; i++) {
      stakeBurnMap[addr].length--;
    }

    if (!addressContainsStakeBurnRcord(addr)) {
      uint resultLen = stakeBurnAddresses.length;
      for(uint i = 0; i < resultLen; i++) {
        if (stakeBurnAddresses[i] == addr) {
          if(i != resultLen -1) {
            stakeBurnAddresses[i] = stakeBurnAddresses[stakeBurnAddresses.length - 1];
          }
          delete stakeBurnAddresses[stakeBurnAddresses.length - 1];
          stakeBurnAddresses.length --;
          break;
        }
      }
    }

    if (_burnAmount > 0) {
      IERC20Burnable token = IERC20Burnable(burnTokenAddress);
      require(token.burn(_burnAmount));
      emit Burn(addr, cutoff, _burnAmount);
    }
  }

  function addStakeBurnRcord(address _key, StakeBurnRecord memory _record) internal {
    if (!addressContainsStakeBurnRcord(_key)) {
      stakeBurnAddresses.push(_key);
    }
    stakeBurnMap[_key].push(_record);
  }

  function addressContainsStakeBurnRcord(address _key) internal view returns (bool) {
      return stakeBurnMap[_key].length > 0;
  }

  function getStakeBurnAddresses() public view returns (address[] memory) {
      return stakeBurnAddresses;
  }

  function getStakedAddresses() public view returns (address[] memory) {
      return stakedAddresses;
  }
}
