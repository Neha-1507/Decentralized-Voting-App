// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Voting - multi-election decentralized voting (starter version)
/// @notice Admin creates elections, adds candidates, registers eligible voters.
///         Each registered address can vote once per election, only inside the time window.
/// @dev Votes are PUBLIC on-chain in this version. Anonymous voting (ZK) is a later module.
contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Election {
        string title;
        uint64 startTime;
        uint64 endTime;
        bool exists;
    }

    address public admin;
    uint256 public electionCount;
    bool public paused;

    mapping(uint256 => Election) private elections;
    mapping(uint256 => Candidate[]) private candidates;
    mapping(uint256 => mapping(address => bool)) public isRegistered;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ElectionCreated(uint256 indexed electionId, string title, uint64 startTime, uint64 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateIndex, string name);
    event VoterRegistered(uint256 indexed electionId, address voter);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 candidateIndex);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event Paused(address account);
    event Unpaused(address account);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier electionExists(uint256 electionId) {
        require(elections[electionId].exists, "Election not found");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ---------------- Admin ----------------

    function createElection(string calldata title, uint64 startTime, uint64 endTime)
        external
        onlyAdmin
        returns (uint256 electionId)
    {
        require(bytes(title).length > 0, "Title required");
        require(startTime >= block.timestamp, "Start in past");
        require(endTime > startTime, "End must be after start");

        electionId = electionCount++;
        elections[electionId] = Election(title, startTime, endTime, true);
        emit ElectionCreated(electionId, title, startTime, endTime);
    }

    function addCandidate(uint256 electionId, string calldata name)
        external
        onlyAdmin
        electionExists(electionId)
    {
        require(block.timestamp < elections[electionId].startTime, "Election already started");
        require(bytes(name).length > 0, "Name required");

        candidates[electionId].push(Candidate(name, 0));
        emit CandidateAdded(electionId, candidates[electionId].length - 1, name);
    }

    function registerVoters(uint256 electionId, address[] calldata voters)
        external
        onlyAdmin
        electionExists(electionId)
    {
        require(block.timestamp < elections[electionId].endTime, "Election ended");
        for (uint256 i = 0; i < voters.length; i++) {
            if (!isRegistered[electionId][voters[i]]) {
                isRegistered[electionId][voters[i]] = true;
                emit VoterRegistered(electionId, voters[i]);
            }
        }
    }

    function pause() external onlyAdmin {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyAdmin {
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero address");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    // ---------------- Voting ----------------

    function vote(uint256 electionId, uint256 candidateIndex) external electionExists(electionId) whenNotPaused {
        Election storage e = elections[electionId];
        require(block.timestamp >= e.startTime, "Not started");
        require(block.timestamp <= e.endTime, "Ended");
        require(isRegistered[electionId][msg.sender], "Not a registered voter");
        require(!hasVoted[electionId][msg.sender], "Already voted");
        require(candidateIndex < candidates[electionId].length, "Bad candidate");

        hasVoted[electionId][msg.sender] = true;
        candidates[electionId][candidateIndex].voteCount += 1;
        emit VoteCast(electionId, msg.sender, candidateIndex);
    }

    // ---------------- Views ----------------

    // @return status 0 = upcoming, 1 = active, 2 = ended
    function getElection(uint256 electionId)
        external
        view
        electionExists(electionId)
        returns (string memory title, uint64 startTime, uint64 endTime, uint8 status, uint256 candidateCount)
    {
        Election storage e = elections[electionId];
        if (block.timestamp < e.startTime) status = 0;
        else if (block.timestamp <= e.endTime) status = 1;
        else status = 2;
        return (e.title, e.startTime, e.endTime, status, candidates[electionId].length);
    }

    function getCandidates(uint256 electionId)
        external
        view
        electionExists(electionId)
        returns (Candidate[] memory)
    {
        return candidates[electionId];
    }
}
