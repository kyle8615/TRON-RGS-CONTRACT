pragma solidity ^0.5.2;

import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract AdministratorOwnable is Pausable {

  address public administrator;

  event AdministratorTransferred(address oldAddr, address newAddr);

  constructor() public {
    administrator = msg.sender;
  }

  modifier onlyAdministrator() {
    require(msg.sender == administrator, 'administrator required');
    _;
  }

  function transferAdministrator(address admin) public onlyAdministrator {
    require(administrator != address(0), 'empty address');
    emit AdministratorTransferred(administrator, admin);
    _removePauser(administrator);
    _addPauser(admin);
    administrator = admin;
  }
}
