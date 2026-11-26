const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Admin transfer", function () {
  let voting, admin, other;

  beforeEach(async () => {
    [admin, other] = await ethers.getSigners();
    voting = await (await ethers.getContractFactory("Voting")).deploy();
  });

  it("admin can transfer the admin role", async () => {
    await expect(voting.transferAdmin(other.address))
      .to.emit(voting, "AdminTransferred")
      .withArgs(admin.address, other.address);
    expect(await voting.admin()).to.equal(other.address);
  });

  it("non-admin cannot transfer", async () => {
    await expect(voting.connect(other).transferAdmin(other.address)).to.be.revertedWith("Only admin");
  });

  it("cannot transfer to zero address", async () => {
    await expect(voting.transferAdmin(ethers.ZeroAddress)).to.be.revertedWith("Zero address");
  });

  it("old admin loses access after transfer", async () => {
    await voting.transferAdmin(other.address);
    await expect(voting.transferAdmin(admin.address)).to.be.revertedWith("Only admin");
  });
});
