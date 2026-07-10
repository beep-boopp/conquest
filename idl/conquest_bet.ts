/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/conquest_bet.json`.
 */
export type ConquestBet = {
  "address": "79iywL79mqxWLaPiyu5NFztVdmUQ3A5L8iHNSCE9RHTp",
  "metadata": {
    "name": "conquestBet",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "acceptWager",
      "discriminator": [
        214,
        18,
        178,
        214,
        203,
        22,
        50,
        119
      ],
      "accounts": [
        {
          "name": "room",
          "writable": true
        },
        {
          "name": "opponent",
          "signer": true
        },
        {
          "name": "wager",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "predictedOutcome",
          "type": "u8"
        },
        {
          "name": "landStake",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimVictory",
      "discriminator": [
        119,
        177,
        84,
        236,
        128,
        134,
        183,
        199
      ],
      "accounts": [
        {
          "name": "room",
          "writable": true
        },
        {
          "name": "claimant",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "tournamentComplete",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createRoom",
      "discriminator": [
        130,
        166,
        32,
        2,
        247,
        120,
        178,
        53
      ],
      "accounts": [
        {
          "name": "room",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "joinRoom",
      "discriminator": [
        95,
        232,
        188,
        81,
        124,
        130,
        78,
        139
      ],
      "accounts": [
        {
          "name": "room",
          "writable": true
        },
        {
          "name": "player",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "proposeWager",
      "discriminator": [
        83,
        236,
        237,
        63,
        94,
        112,
        79,
        23
      ],
      "accounts": [
        {
          "name": "room",
          "writable": true
        },
        {
          "name": "wager",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  103,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "room"
              },
              {
                "kind": "arg",
                "path": "wagerId"
              }
            ]
          }
        },
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "opponent",
          "docs": [
            "until accept_wager."
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "wagerId",
          "type": "u64"
        },
        {
          "name": "predictionType",
          "type": {
            "defined": {
              "name": "predictionType"
            }
          }
        },
        {
          "name": "fixtureId",
          "type": "u64"
        },
        {
          "name": "proposerPredictedOutcome",
          "type": "u8"
        },
        {
          "name": "landStake",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolveWager",
      "discriminator": [
        31,
        179,
        1,
        228,
        83,
        224,
        1,
        123
      ],
      "accounts": [
        {
          "name": "room",
          "writable": true
        },
        {
          "name": "wager",
          "writable": true
        },
        {
          "name": "resolver",
          "signer": true
        },
        {
          "name": "txlineProgram",
          "docs": [
            "until the CPI described above is wired up."
          ]
        },
        {
          "name": "merkleProofAccount",
          "docs": [
            "stat(s). Unused until the CPI described above is wired up."
          ]
        }
      ],
      "args": [
        {
          "name": "matchResult",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "room",
      "discriminator": [
        156,
        199,
        67,
        27,
        222,
        23,
        185,
        94
      ]
    },
    {
      "name": "wager",
      "discriminator": [
        3,
        110,
        53,
        190,
        113,
        31,
        230,
        40
      ]
    }
  ],
  "events": [
    {
      "name": "roomCompleted",
      "discriminator": [
        191,
        61,
        155,
        19,
        210,
        52,
        85,
        102
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "roomFull",
      "msg": "Room already has the maximum number of players."
    },
    {
      "code": 6001,
      "name": "roomAlreadyStarted",
      "msg": "Room has already started; no new players can join."
    },
    {
      "code": 6002,
      "name": "playerAlreadyInRoom",
      "msg": "Player is already a member of this room."
    },
    {
      "code": 6003,
      "name": "invalidPlayer",
      "msg": "Account is not a valid player for this action."
    },
    {
      "code": 6004,
      "name": "invalidWagerStatus",
      "msg": "Wager is not in the expected status for this action."
    },
    {
      "code": 6005,
      "name": "wagerRoomMismatch",
      "msg": "Wager does not belong to the supplied room."
    },
    {
      "code": 6006,
      "name": "samePredictedOutcome",
      "msg": "Predicted outcome must differ from the proposer's predicted outcome."
    },
    {
      "code": 6007,
      "name": "insufficientLand",
      "msg": "Player does not have enough land to cover this stake."
    },
    {
      "code": 6008,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow while updating land balances."
    },
    {
      "code": 6009,
      "name": "roomNotComplete",
      "msg": "Room cannot be completed yet: no player is eliminated and the tournament is not marked complete."
    },
    {
      "code": 6010,
      "name": "roomAlreadyCompleted",
      "msg": "Room has already been completed."
    }
  ],
  "types": [
    {
      "name": "predictionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "matchWinner"
          },
          {
            "name": "overUnderGoals"
          },
          {
            "name": "bothTeamsScore"
          },
          {
            "name": "customProp"
          }
        ]
      }
    },
    {
      "name": "room",
      "docs": [
        "A private room where 2-5 friends compete for land over the tournament.",
        "",
        "`players` and `land_balances` are parallel fixed-size arrays indexed",
        "together (players[i] owns land_balances[i]). Unused slots hold",
        "Pubkey::default() / 0. Fixed size avoids needing account realloc logic."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "roomId",
            "type": "u64"
          },
          {
            "name": "players",
            "type": {
              "array": [
                "pubkey",
                5
              ]
            }
          },
          {
            "name": "landBalances",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "playerCount",
            "type": "u8"
          },
          {
            "name": "started",
            "docs": [
              "Flips to true when the first wager is proposed in this room, after",
              "which join_room is rejected — keeps the roster fixed once play begins."
            ],
            "type": "bool"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "roomStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "roomCompleted",
      "docs": [
        "Emitted by claim_victory. Winner is surfaced via event rather than",
        "persisted on Room, since it's derivable read-only from land_balances."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "room",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "winnerLand",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roomStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "completed"
          }
        ]
      }
    },
    {
      "name": "wager",
      "docs": [
        "A single agreed-upon prediction wager between two players in a room.",
        "",
        "`proposer_predicted_outcome` / `opponent_predicted_outcome` are opaque u8",
        "codes whose meaning depends on `prediction_type` (e.g. for MatchWinner:",
        "0 = Participant1, 1 = Draw, 2 = Participant2; for OverUnderGoals:",
        "0 = Under, 1 = Over). Interpreted off-chain and by resolve_wager."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "room",
            "type": "pubkey"
          },
          {
            "name": "wagerId",
            "type": "u64"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "opponent",
            "type": "pubkey"
          },
          {
            "name": "predictionType",
            "type": {
              "defined": {
                "name": "predictionType"
              }
            }
          },
          {
            "name": "fixtureId",
            "type": "u64"
          },
          {
            "name": "proposerPredictedOutcome",
            "type": "u8"
          },
          {
            "name": "opponentPredictedOutcome",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "proposerStake",
            "type": "u64"
          },
          {
            "name": "opponentStake",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "wagerStatus"
              }
            }
          },
          {
            "name": "outcome",
            "type": {
              "option": {
                "defined": {
                  "name": "wagerOutcome"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "wagerOutcome",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "proposerWon"
          },
          {
            "name": "opponentWon"
          },
          {
            "name": "push"
          }
        ]
      }
    },
    {
      "name": "wagerStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "proposed"
          },
          {
            "name": "locked"
          },
          {
            "name": "resolved"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    }
  ]
};
