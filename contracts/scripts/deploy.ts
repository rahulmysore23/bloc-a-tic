import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EventTickets contract...");

  const EventTickets = await ethers.getContractFactory("EventTickets");
  const eventTickets = await EventTickets.deploy();

  await eventTickets.waitForDeployment();

  const address = await eventTickets.getAddress();
  console.log("EventTickets deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 