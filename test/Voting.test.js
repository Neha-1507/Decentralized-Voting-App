const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting", function () {
  let voting, admin, alice, bob, eve;
  let start, end;

  beforeEach(async () => {
    [admin, alice, bob, eve] = await ethers.getSigners();
    voting = await (await ethers.getContractFactory("Voting")).deploy();
    const now = await time.latest();
    start = now + 100;
    end = now + 1000;
    await voting.createElection("College President", start, end);
    await voting.addCandidate(0, "Rahul");
    await voting.addCandidate(0, "Priya");
    await voting.registerVoters(0, [alice.address, bob.address]);
  });

  it("only admin can create elections", async () => {
    await expect(voting.connect(alice).createElection("X", start, end)).to.be.revertedWith("Only admin");
  });

  it("cannot vote before start", async () => {
    await expect(voting.connect(alice).vote(0, 0)).to.be.revertedWith("Not started");
  });

  it("registered voter can vote once", async () => {
    await time.increaseTo(start + 1);
    await voting.connect(alice).vote(0, 1);
    const cands = await voting.getCandidates(0);
    expect(cands[1].voteCount).to.equal(1n);
    await expect(voting.connect(alice).vote(0, 0)).to.be.revertedWith("Already voted");
  });

  it("unregistered address cannot vote", async () => {
    await time.increaseTo(start + 1);
    await expect(voting.connect(eve).vote(0, 0)).to.be.revertedWith("Not a registered voter");
  });

  it("cannot vote after end", async () => {
    await time.increaseTo(end + 1);
    await expect(voting.connect(bob).vote(0, 0)).to.be.revertedWith("Ended");
  });

  it("reports election status", async () => {
    let e = await voting.getElection(0);
    expect(e.status).to.equal(0n);
    await time.increaseTo(start + 1);
    e = await voting.getElection(0);
    expect(e.status).to.equal(1n);
    await time.increaseTo(end + 1);
    e = await voting.getElection(0);
    expect(e.status).to.equal(2n);
  });
});
