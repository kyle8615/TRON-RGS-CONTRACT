
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract RgsToken is ERC20Capped, ERC20Detailed, Ownable {

  constructor(string memory _name, string memory _symbol, uint256 cap) ERC20Capped(cap) ERC20Detailed(_name, _symbol, 6) public {
  }

  /**
   * @dev Destroys `amount` tokens from the caller.
   *
   * See {ERC20-_burn}.
   */
  function burn(uint256 amount) public returns (bool) {
      _burn(_msgSender(), amount);
      return true;
  }

  /**
   * @dev See {ERC20-_burnFrom}.
   */
  function burnFrom(address account, uint256 amount) public returns (bool) {
      _burnFrom(account, amount);
      return true;
  }
}
