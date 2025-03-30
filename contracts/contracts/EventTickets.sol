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
        address creator; // Track who created the event
    }
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public ticketToEvent;
    mapping(uint256 => address) public eventCreators; // Event ID => Creator

    constructor() ERC721("EventTicket", "TICKET") Ownable(msg.sender) {}

    // Any user can create an event now
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

    // Only event creator or owner can toggle activity
    function toggleEventActive(uint256 _eventId) external {
        require(
            msg.sender == eventCreators[_eventId] || msg.sender == owner(),
            "Only creator or owner"
        );
        events[_eventId].isActive = !events[_eventId].isActive;
    }

    // Rest of the functions remain the same as before
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
                activeEvents[index].name = events[i].name;
                activeEvents[index].description = events[i].description;
                index++;
            }
        }
        return activeEvents;
    }

    function getEventDetails(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }

    function getMyTicketsForEvent(uint256 _eventId) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(msg.sender);
        uint256[] memory ticketIds = new uint256[](balance);
        uint256 counter;
        
        for (uint256 i = 0; i < nextTicketId; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == msg.sender && ticketToEvent[i] == _eventId) {
                    ticketIds[counter] = i;
                    counter++;
                }
            } catch {
                continue;
            }
        }
        
        uint256[] memory result = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            result[i] = ticketIds[i];
        }
        return result;
    }
} 