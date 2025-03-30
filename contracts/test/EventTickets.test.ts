import { expect } from "chai";
import { ethers } from "hardhat";
import { EventTickets } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EventTickets", function () {
  let eventTickets: EventTickets;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const EventTickets = await ethers.getContractFactory("EventTickets");
    eventTickets = await EventTickets.deploy();
    await eventTickets.waitForDeployment();
  });

  describe("Event Creation", function () {
    it("Should create a new event", async function () {
      const eventName = "Test Event";
      const eventDescription = "Test Description";
      const price = ethers.parseEther("0.1");
      const maxTickets = 100;
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow

      await eventTickets.connect(addr1).createEvent(
        eventName,
        eventDescription,
        price,
        maxTickets,
        eventDate
      );

      const event = await eventTickets.getEventDetails(0);
      expect(event.name).to.equal(eventName);
      expect(event.description).to.equal(eventDescription);
      expect(event.price).to.equal(price);
      expect(event.maxTickets).to.equal(maxTickets);
      expect(event.ticketsSold).to.equal(0);
      expect(event.eventDate).to.equal(eventDate);
      expect(event.isActive).to.equal(true);
      expect(event.creator).to.equal(addr1.address);
    });
  });

  describe("Ticket Purchase", function () {
    beforeEach(async function () {
      await eventTickets.connect(addr1).createEvent(
        "Test Event",
        "Test Description",
        ethers.parseEther("0.1"),
        100,
        Math.floor(Date.now() / 1000) + 86400
      );
    });

    it("Should allow ticket purchase", async function () {
      const quantity = 2;
      const price = ethers.parseEther("0.1");
      const totalCost = price * BigInt(quantity);

      await eventTickets.connect(addr2).buyTicket(0, quantity, {
        value: totalCost,
      });

      const event = await eventTickets.getEventDetails(0);
      expect(event.ticketsSold).to.equal(quantity);

      // Check that the buyer owns the tickets
      const balance = await eventTickets.balanceOf(addr2.address);
      expect(balance).to.equal(quantity);

      // Check that the tickets are owned by the buyer
      for (let i = 0; i < quantity; i++) {
        const owner = await eventTickets.ownerOf(i);
        expect(owner).to.equal(addr2.address);
      }
    });

    it("Should fail if insufficient payment", async function () {
      const quantity = 2;
      const price = ethers.parseEther("0.1");
      const totalCost = price * BigInt(quantity);
      const insufficientPayment = totalCost - BigInt(1);

      await expect(
        eventTickets.connect(addr2).buyTicket(0, quantity, {
          value: insufficientPayment,
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail if event is not active", async function () {
      await eventTickets.connect(addr1).toggleEventActive(0);

      await expect(
        eventTickets.connect(addr2).buyTicket(0, 1, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWith("Event is not active");
    });
  });

  describe("Event Management", function () {
    beforeEach(async function () {
      await eventTickets.connect(addr1).createEvent(
        "Test Event",
        "Test Description",
        ethers.parseEther("0.1"),
        100,
        Math.floor(Date.now() / 1000) + 86400
      );
    });

    it("Should allow creator to toggle event active status", async function () {
      await eventTickets.connect(addr1).toggleEventActive(0);
      let event = await eventTickets.getEventDetails(0);
      expect(event.isActive).to.equal(false);

      await eventTickets.connect(addr1).toggleEventActive(0);
      event = await eventTickets.getEventDetails(0);
      expect(event.isActive).to.equal(true);
    });

    it("Should allow owner to toggle event active status", async function () {
      await eventTickets.connect(owner).toggleEventActive(0);
      let event = await eventTickets.getEventDetails(0);
      expect(event.isActive).to.equal(false);

      await eventTickets.connect(owner).toggleEventActive(0);
      event = await eventTickets.getEventDetails(0);
      expect(event.isActive).to.equal(true);
    });

    it("Should not allow non-creator to toggle event active status", async function () {
      await expect(
        eventTickets.connect(addr2).toggleEventActive(0)
      ).to.be.revertedWith("Only creator or owner");
    });
  });

  describe("Event Queries", function () {
    beforeEach(async function () {
      await eventTickets.connect(addr1).createEvent(
        "Test Event 1",
        "Test Description 1",
        ethers.parseEther("0.1"),
        100,
        Math.floor(Date.now() / 1000) + 86400
      );

      await eventTickets.connect(addr2).createEvent(
        "Test Event 2",
        "Test Description 2",
        ethers.parseEther("0.2"),
        50,
        Math.floor(Date.now() / 1000) + 172800
      );

      // Deactivate the second event
      await eventTickets.connect(addr2).toggleEventActive(1);
    });

    it("Should return only active events", async function () {
      const activeEvents = await eventTickets.getActiveEvents();
      expect(activeEvents.length).to.equal(1);
      expect(activeEvents[0].name).to.equal("Test Event 1");
    });

    it("Should return correct event details", async function () {
      const event = await eventTickets.getEventDetails(0);
      expect(event.name).to.equal("Test Event 1");
      expect(event.description).to.equal("Test Description 1");
      expect(event.price).to.equal(ethers.parseEther("0.1"));
      expect(event.maxTickets).to.equal(100);
      expect(event.ticketsSold).to.equal(0);
      expect(event.isActive).to.equal(true);
      expect(event.creator).to.equal(addr1.address);
    });
  });
}); 