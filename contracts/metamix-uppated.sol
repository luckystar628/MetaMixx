// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract MetaMixx {
    address public contractOwner;
    address public companyWallet; // company wallet address

    struct User {
        bool registered;
        string referralId;
        address parentReferral;
        address[] childReferrals;
        uint256 level;
    }

    mapping(address => User) private users;
    mapping(string => address) public referralIds;
    uint256[] public prices = [10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120];
    uint256[] private parentPercentages = [20, 17, 15, 13, 11, 9, 7, 5, 3];

    ERC20 public token; // Add this line to store the BEP20 token address

    event UserRegistered(
        address indexed user,
        string referralId,
        address indexed parent
    );
    event PackagePurchased(
        address indexed user,
        uint256 packageLevel,
        uint256 amount
    );
    event FundsWithdrawn(address indexed owner, uint amount);  //????????????????????????? What is it ???????????????????????????
    event UpdateOwner(address indexed owner);  
    event UpdateUser(address indexed _oldAddress, address indexed _newAddress);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Not the owner");
        _;
    }


// the constructor only runs once when the contract is deployed
// it is used to initialize the contract state
    constructor(string memory _referralId, address _tokenAddress) {
        contractOwner = msg.sender;
        users[msg.sender].registered = true;
        users[msg.sender].referralId = _referralId;
        users[msg.sender].parentReferral = msg.sender;
        users[msg.sender].level = 10;
        referralIds[_referralId] = msg.sender;
        token = ERC20(_tokenAddress); // Initialize the BEP20 token contract
    }

    function isPayable(address _address) private returns (bool) {
        return payable(_address).send(0);
        //return !isContract(_address);
    }

    function registerUser(
        string memory _referralId,
        address _referralAddress
    ) public {
        require(!users[msg.sender].registered, "User already registered");
        require(
            referralIds[_referralId] == address(0),
            "Referral ID already exists"
        );
        require(
            users[_referralAddress].registered,
            "Referral address not registered"
        );
        users[msg.sender].registered = true;
        users[msg.sender].referralId = _referralId;
        users[msg.sender].parentReferral = _referralAddress;
        User storage parent = users[_referralAddress];  //parent of the msg.sender
        parent.childReferrals.push(msg.sender);
        referralIds[_referralId] = msg.sender; // log a new  referalId in referalIds list ( map(string => address) ) 
        emit UserRegistered(msg.sender, _referralId, _referralAddress);
    }

    function updateOwner(
        address _newOwner
    ) public onlyOwner returns (bool) {
        require(
            _newOwner != address(0) &&
                !users[_newOwner].registered &&
                isPayable(_newOwner),
            "Invalid new owner address."
        );
        contractOwner = _newOwner;
        // users is mapping(address => User(??struct??)), so like as below!!
        users[contractOwner].registered = true;
        users[contractOwner].referralId = users[msg.sender].referralId;
        users[contractOwner].parentReferral = contractOwner;
        users[contractOwner].level = 10;
        referralIds[users[msg.sender].referralId] = contractOwner;
        
        // insert previous owner's children to new owner
        address[] memory childReferrals = users[msg.sender].childReferrals;
        for (uint256 i = 0; i < childReferrals.length; i++) {
            address child = childReferrals[i];
            users[contractOwner].childReferrals.push(child);
            users[child].parentReferral = contractOwner;
        }

        delete users[msg.sender];

        emit UpdateOwner(contractOwner);
        return true;
    }

    function updateUser(
        address _oldAddress,
        address _newAddress
    ) public onlyOwner returns (bool) {
        require(
            users[_oldAddress].registered,
            "_oladAddress wasn't registered"
        );
        require(
            !users[_newAddress].registered,
            "_newAddress was already registered"
        );
        require(
            _newAddress != address(0) && isPayable(_newAddress),
            "Invalid new address"
        );

        users[_newAddress].registered = true;
        users[_newAddress].referralId = users[_oldAddress].referralId;
        users[_newAddress].parentReferral = users[_oldAddress].parentReferral;
        users[_newAddress].level = users[_oldAddress].level;
        User storage parent = users[users[_newAddress].parentReferral];
        
        // update oldAddress as newAddress in parent children list.
        for (uint256 i = 0; i < parent.childReferrals.length; i++) {
            if (parent.childReferrals[i] == _oldAddress) {
                parent.childReferrals[i] = _newAddress;
                break;
            }
        }

        // copy oldAddress' child users.
        for (uint256 i = 0; i < users[_oldAddress].childReferrals.length; i++) {
            address child = users[_oldAddress].childReferrals[i];
            users[_newAddress].childReferrals.push(child);
            users[child].parentReferral = _newAddress;

        }

        referralIds[users[_newAddress].referralId] = _newAddress;
        
        delete users[_oldAddress];

        emit UpdateUser(_oldAddress, _newAddress);
        return true;
    }

    function getUser(address _user) public view returns (User memory) {
        return users[_user];
    }

    function buyPackage(
        string memory _referralId,
        address _referralAddress,
        uint256 _level
    ) public {
        if (!users[msg.sender].registered) {
            registerUser(_referralId, _referralAddress);
        }
        require(users[msg.sender].registered, "User not registered");
        require(_level > 0 && _level <= prices.length, "Invalid package level");
        require(
            token.balanceOf(msg.sender) >= prices[_level - 1],
            "Insufficient balance in BEP20 token"
        );
        uint256 tokenUnitAmount = (10 ** token.decimals());
        require(
            token.transferFrom(
                msg.sender,
                address(this),
                prices[_level - 1] * tokenUnitAmount
            ),
            "Failed to transfer BEP20 tokens"
        );
        require(
            _level == users[msg.sender].level + 1,
            "Must purchase packages in order"
        );

        users[msg.sender].level = _level;

        // Distribute funds
        uint256 currentprice = prices[_level - 1];
        uint256 companyShare = (prices[_level - 1] * 20) / 100;
        uint256 directParentShare = (prices[_level - 1] * 40) / 100;
        uint256 brotherCount = users[_referralAddress].childReferrals.length;
        uint256 amountBrotherDistributionShare = tokenUnitAmount * ((currentprice * 20) / 100) / brotherCount;
        uint256 remainingShare = prices[_level - 1] -
            companyShare -
            directParentShare - ((currentprice * 20) / 100); // last part calculation is brothers share. brother share formula = ((currentprice * 20) / 100)
        address directParentAddress = _referralAddress;
        console.log("direct parent address: ", _referralAddress);
        address nextParentAddress = users[directParentAddress].parentReferral;
        address[] memory uplineParentAddresses = new address[](10);
        uint256 uplineParentCount = 0;
        User storage parent = users[_referralAddress];
        // Transfer company share to company wallet
        require(
            token.transfer(companyWallet, companyShare * tokenUnitAmount),
            "Error in sending BEP20 tokens to Company Wallet"
        );

        
        for (uint256 i = 0; i < brotherCount - 1; i++) {
            token.transfer(parent.childReferrals[i], amountBrotherDistributionShare);
        }
        if (brotherCount > 0) {
            uint256 lastDistributionAmount = tokenUnitAmount * ((currentprice * 20) / 100) - (brotherCount - 1) * amountBrotherDistributionShare;
            token.transfer(parent.childReferrals[brotherCount - 1], lastDistributionAmount);
        }
        while (
            uplineParentCount < parentPercentages.length &&
            nextParentAddress != address(0)
        ) {
            uplineParentAddresses[uplineParentCount] = nextParentAddress;
            uplineParentCount++;
            if (nextParentAddress == users[nextParentAddress].parentReferral)
                break;
            nextParentAddress = users[nextParentAddress].parentReferral;
        }
        console.log("parentAddress length", uplineParentCount);

        if (users[directParentAddress].level < _level) {
            console.log("current user's level is higher than direct user");
            require(
                token.transfer(
                    directParentAddress,
                    ((10 ** token.decimals()) * directParentShare) /
                        (uplineParentCount + 1)
                ),
                "Error in sending BEP20 tokens to Parent Wallet"
            );
            if (uplineParentCount < 9 && uplineParentCount > 0) {
                for (uint256 i = 0; i < uplineParentCount; i++) {
                    require(
                        token.transfer(
                            uplineParentAddresses[i],
                            ((10 ** token.decimals()) * remainingShare) /
                                uplineParentCount +
                                ((10 ** token.decimals()) * directParentShare) /
                                (uplineParentCount + 1)
                        ),
                        "Error in sending BEP20 tokens to Upline Parent wallet in case that uplineParentCount is less than 9"
                    );
                }
            } else if (uplineParentCount >= 9) {
                for (uint256 i = 0; i < parentPercentages.length; i++) {
                    require(
                        token.transfer(
                            uplineParentAddresses[i],
                            ((10 ** token.decimals()) * directParentShare) /
                                (uplineParentCount + 1) +
                                ((10 ** token.decimals()) *
                                    remainingShare *
                                    parentPercentages[i]) /
                                100
                        ),
                        "Error in sending BEP20 tokens to Upline Parent wallet in case that uplineParentCount is 9"
                    );
                }
            }
        } else {
            console.log("current user's level is less than direct user");
            require(
                token.transfer(
                    directParentAddress,
                    directParentShare * tokenUnitAmount
                ),
                "Error in sending BEP20 tokens to directParent"
            );

            console.log(
                "remainingShare",
                remainingShare,
                "sharePerUplineParent30",
                ((10 ** token.decimals()) * remainingShare) / uplineParentCount
            );

            if (uplineParentCount < 9 && uplineParentCount > 0) {
                for (uint256 i = 0; i < uplineParentCount; i++) {
                    require(
                        token.transfer(
                            uplineParentAddresses[i],
                            ((10 ** token.decimals()) * remainingShare) /
                                uplineParentCount
                        ),
                        "Error in sending BEP20 to Upline Parent wallet in case that current user's level is less than his direct parent's level"
                    );
                }
            } else if (uplineParentCount >= 9) {
                for (uint256 i = 0; i < parentPercentages.length; i++) {
                    require(
                        token.transfer(
                            uplineParentAddresses[i],
                            ((10 ** token.decimals()) *
                                remainingShare *
                                parentPercentages[i]) / 100
                        ),
                        "Error in sending BEP20 tokens to Upline Parent wallet in case that uplineParentCount is 9"
                    );
                }
            }
        }
        
        emit PackagePurchased(msg.sender, _level, currentprice);
    }

    function updatePackagePrice(
        uint256 _level,
        uint256 _price
    ) public onlyOwner {
        require(_level > 0 && _level <= prices.length, "Invalid package level");
        prices[_level - 1] = _price;
    }

    function updateCompanyWallet(address _newCompanyWallet) public onlyOwner {
        require(
            _newCompanyWallet != address(0),
            "Invalid company wallet address"
        );
        companyWallet = _newCompanyWallet;
    }

    function withdraw() public onlyOwner {
        uint balance = token.balanceOf(address(this));
        require(
            token.transfer(contractOwner, balance),
            "Error in withdrawing BEP20 tokens"
        );
        emit FundsWithdrawn(contractOwner, balance);
    }
}
