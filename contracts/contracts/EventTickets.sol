// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTickets is ERC721, Ownable {
    uint256 public nextTicketId;
    uint256 public nextEventId;
    
    struct Event {
        string name;
        string description;
        uint256 price;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 eventDate;
        bool isActive;
        address creator;
    }
    
    struct TicketInfo {
        uint256 eventId;
        string eventName;
        string eventDescription;
        uint256 eventDate;
        bool isActive;
        uint256 price;
        uint256 maxTickets;
        uint256 ticketsSold;
    }
    
    // Main mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public ticketToEvent;
    mapping(uint256 => address) public eventCreators;
    
    // New mappings for efficient ticket lookup
    mapping(address => uint256[]) public userTickets; // user address => array of ticket IDs
    mapping(uint256 => uint256) public ticketIndex; // ticket ID => index in userTickets array

    constructor() ERC721("EventTicket", "TICKET") Ownable(msg.sender) {}

    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _maxTickets,
        uint256 _eventDate
    ) external {
        uint256 eventId = nextEventId++;
        events[eventId] = Event({
            name: _name,
            description: _description,
            price: _price,
            maxTickets: _maxTickets,
            ticketsSold: 0,
            eventDate: _eventDate,
            isActive: true,
            creator: msg.sender
        });
        eventCreators[eventId] = msg.sender;
    }

    function toggleEventActive(uint256 _eventId) external {
        require(
            msg.sender == eventCreators[_eventId] || msg.sender == owner(),
            "Only creator or owner"
        );
        events[_eventId].isActive = !events[_eventId].isActive;
    }

    function buyTicket(uint256 _eventId, uint256 _quantity) external payable {
        Event storage eventInfo = events[_eventId];
        require(eventInfo.isActive, "Event is not active");
        require(_quantity > 0, "Quantity must be at least 1");
        uint256 totalCost = eventInfo.price * _quantity;
        require(msg.value >= totalCost, "Insufficient payment");
        require(
            eventInfo.ticketsSold + _quantity <= eventInfo.maxTickets,
            "Not enough tickets available"
        );
        
        for (uint256 i = 0; i < _quantity; i++) {
            uint256 ticketId = nextTicketId++;
            _safeMint(msg.sender, ticketId);
            ticketToEvent[ticketId] = _eventId;
            eventInfo.ticketsSold++;
            
            // Add ticket to user's ticket list
            userTickets[msg.sender].push(ticketId);
            ticketIndex[ticketId] = userTickets[msg.sender].length - 1;
        }

        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }

    function getActiveEvents() external view returns (Event[] memory) {
        uint256 activeCount;
        for (uint256 i = 0; i < nextEventId; i++) {
            if (events[i].isActive) {
                activeCount++;
            }
        }
        
        Event[] memory activeEvents = new Event[](activeCount);
        uint256 index;
        for (uint256 i = 0; i < nextEventId; i++) {
            if (events[i].isActive) {
                activeEvents[index] = events[i];
                index++;
            }
        }
        return activeEvents;
    }

    function getEventDetails(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }

    function getTicketsByAddress(address _owner) external view returns (TicketInfo[] memory) {
        uint256[] memory userTicketIds = userTickets[_owner];
        TicketInfo[] memory result = new TicketInfo[](userTicketIds.length);
        
        for (uint256 i = 0; i < userTicketIds.length; i++) {
            uint256 ticketId = userTicketIds[i];
            uint256 eventId = ticketToEvent[ticketId];
            Event memory eventInfo = events[eventId];
            
            result[i] = TicketInfo({
                eventId: eventId,
                eventName: eventInfo.name,
                eventDescription: eventInfo.description,
                eventDate: eventInfo.eventDate,
                isActive: eventInfo.isActive,
                price: eventInfo.price,
                maxTickets: eventInfo.maxTickets,
                ticketsSold: eventInfo.ticketsSold
            });
        }
        
        return result;
    }
}