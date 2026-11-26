const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Pause", function () {
  let voting, admin, alice;

  beforeEach(async () => {
    [admin, alice] = await ethers.getSigners();
    voting = await (await ethers.getContractFactory("Voting")).deploy();
    const now = await time.latest();
    const start = now + 100;
    await voting.createElection("Pause test", start, now + 1000);
    await voting.addCandidate(0, "A");
    await voting.registerVoters(0, [alice.address]);
    await time.increaseTo(start + 1);
  });

  it("admin can pause and unpause", async () => {
    await expect(voting.pause()).to.emit(voting, "Paused").withArgs(admin.address);
    expect(await voting.paused()).to.equal(true);
    await expect(voting.unpause()).to.emit(voting, "Unpaused").withArgs(admin.address);
    expect(await voting.paused()).to.equal(false);
  });

  it("voting is blocked while paused and works after unpause", async () => {
    await voting.pause();
    await expect(voting.connect(alice).vote(0, 0)).to.be.revertedWith("Paused");
    await voting.unpause();
    await voting.connect(alice).vote(0, 0);
    expect((await voting.getCandidates(0))[0].voteCount).to.equal(1n);
  });

  it("non-admin cannot pause", async () => {
    await expect(voting.connect(alice).pause()).to.be.revertedWith("Only admin");
  });

  it("rejects double pause and unpause when not paused", async () => {
    await expect(voting.unpause()).to.be.revertedWith("Not paused");
    await voting.pause();
    await expect(voting.pause()).to.be.revertedWith("Already paused");
  });
});
