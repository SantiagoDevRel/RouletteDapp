// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";

contract Roulette is VRFV2WrapperConsumerBase {
    uint256 entryFees = 0.001 ether;
    uint32 constant callbackGasLimit = 1_000_000; //How much I'm willing to pay for the callback fn that Chainlink send to my contract back
    uint32 constant numWords = 1; //How many random words I need to receive from VRF
    uint16 constant requestConfirmations = 3; //Minimum 3 blocks
    address constant linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; //LINK token address in goerli
    address constant vrfWrapperAddress =
        0x708701a1DfF4f478de54383E49a627eD4852C816; //vrf address in goerli

    event RouletteRolled(uint256 requestId);
    event RouletteResult(uint256 requestId, bool userWin);
    event TransferWinner(address player, uint256 amount);

    enum RouletteColor {
        Black, //uint8 = 0
        Red //uint8 = 1
    }

    struct RouletteRollStatus {
        uint256 fees;
        uint256 randomWord;
        address payable player;
        bool userWin;
        bool fulfilled;
        RouletteColor color;
    }

    mapping(uint256 => RouletteRollStatus) public statuses;

    constructor()
        payable
        VRFV2WrapperConsumerBase(linkAddress, vrfWrapperAddress)
    {}

    function roll(RouletteColor _color) external payable returns (uint256) {
        require(msg.value >= entryFees, "Incorrect entry fees amount");
        uint256 requestId = requestRandomness(
            callbackGasLimit,
            requestConfirmations,
            numWords
        );

        statuses[requestId] = RouletteRollStatus(
            VRF_V2_WRAPPER.calculateRequestPrice(callbackGasLimit),
            0,
            payable(msg.sender),
            false,
            false,
            _color // 0(black) or 1(red)
        );
        emit RouletteRolled(requestId);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(statuses[_requestId].fees >= 0, "Request not found");
        statuses[_requestId].fulfilled = true; //Request is fulfilled
        statuses[_requestId].randomWord = _randomWords[0]; //Take the element[0] from the array numWords from Chainlink

        RouletteColor result = RouletteColor.Black; //create variable result default as RouletteColor.black
        if (_randomWords[0] % 2 == 0) {
            //if randomWord is divisible by 2, change result to RouletteColor.red
            result = RouletteColor.Red;
        }

        if (statuses[_requestId].color == result) {
            statuses[_requestId].userWin = true;
            payable(statuses[_requestId].player).transfer(entryFees * 2);
            emit TransferWinner(statuses[_requestId].player, entryFees * 2);
        }

        emit RouletteResult(_requestId, statuses[_requestId].userWin);
    }

    function getStatus(
        uint256 _requestId
    ) public view returns (RouletteRollStatus memory) {
        return statuses[_requestId];
    }
}
