// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BeaconRegistry {
    struct Beacon {
        string beaconId;
        int256 latitude;
        int256 longitude;
        address owner;
        bool active;
        uint256 registeredAt;
    }
    
    struct Incident {
        string beaconId;
        uint256 timestamp;
        int256 latitude;
        int256 longitude;
        string incidentType;
        bool resolved;
    }
    
    mapping(string => Beacon) public beacons;
    mapping(uint256 => Incident) public incidents;
    uint256 public incidentCount;
    
    event BeaconRegistered(string beaconId, int256 lat, int256 lng);
    event IncidentRecorded(uint256 incidentId, string beaconId, uint256 timestamp);
    
    function registerBeacon(string memory _beaconId, int256 _lat, int256 _lng) public {
        beacons[_beaconId] = Beacon(_beaconId, _lat, _lng, msg.sender, true, block.timestamp);
        emit BeaconRegistered(_beaconId, _lat, _lng);
    }
    
    function recordIncident(string memory _beaconId, int256 _lat, int256 _lng) public returns (uint256) {
        incidentCount++;
        incidents[incidentCount] = Incident(_beaconId, block.timestamp, _lat, _lng, "MOTION_DETECTED", false);
        emit IncidentRecorded(incidentCount, _beaconId, block.timestamp);
        return incidentCount;
    }
    
    function resolveIncident(uint256 _incidentId) public {
        incidents[_incidentId].resolved = true;
    }
}