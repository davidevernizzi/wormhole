const jsonfile = require('jsonfile');
const elliptic = require('elliptic');
const BigNumber = require('bignumber.js');

const Wormhole = artifacts.require("Wormhole");
const TokenBridge = artifacts.require("TokenBridge");
const BridgeImplementation = artifacts.require("BridgeImplementation");
const TokenImplementation = artifacts.require("TokenImplementation");
const FeeToken = artifacts.require("FeeToken");
const MockBridgeImplementation = artifacts.require("MockBridgeImplementation");
const MockWETH9 = artifacts.require("MockWETH9");

const testSigner1PK = "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0";
const testSigner2PK = "892330666a850761e7370376430bb8c2aa1494072d3bfeaed0c4fa3d5a9135fe";

const WormholeImplementationFullABI = jsonfile.readFileSync("build/contracts/Implementation.json").abi
const BridgeImplementationFullABI = jsonfile.readFileSync("build/contracts/BridgeImplementation.json").abi
const TokenImplementationFullABI = jsonfile.readFileSync("build/contracts/TokenImplementation.json").abi

// The guardian public keys come from docs/devnet.md, and the auth proof were generated as follows:
// go run main.go template shutdown-auth-proof --shutdownPubKey 0xC65c6Ea16d510a45f54c7CD6333BA1304e92D3E8 --shutdownGuardianKey c3b2e45c422a1602333a64078aeb42637370b0f48fe385f9cfa6ad54a8e0c47e
const EthPublicKey = "0xC65c6Ea16d510a45f54c7CD6333BA1304e92D3E8" // This is accounts[9], but it needs to be hardcoded because it was used to generate the auth proofs.

const GuardianPublicKey0 = "0xbeFA429d57cD18b7F8A4d91A2da9AB4AF05d0FBe"
const GuardianPublicKey1 = "0x88D7D8B32a9105d228100E72dFFe2Fae0705D31c"
const GuardianPublicKey2 = "0x58076F561CC62A47087B567C86f986426dFCD000"
const GuardianPublicKey3 = "0xBd6e9833490F8fA87c733A183CD076a6cBD29074"
const GuardianPublicKey9 = "0x647ec26ae49b14060660504f4DA1c2059E1C5Ab6"

const GuardianAuthProof0 = "0x" + "41be56d0dea134a77bee5f3081c4bc45cde341d75fa258247c3cc80ef2c19e2279437c8828cd9fab4acced7da3abc9e1db2a59e8de9e7b73230fcc3e500e86cf00"
const GuardianAuthProof1 = "0x" + "018f86af0e73a7eea01f926cbbeb700f63b49bf8b9eed0f7d8fbae91d89678cb2eeea1eba6043ce0c8566b6517bad5f1bbf64a6808f11cb6192461b317a7265701"
const GuardianAuthProof2 = "0x" + "d4180a518db560d1812e4fa47247fbcb42910a647d0db58a0fb9f7770457e71971e04cfbd055de355680ee4c6461a73c1c783d55d946ba79488228a8eed758bc01"
const GuardianAuthProof3 = "0x" + "fe66ea64b02218041bf9eca224ac5e0cacc92710876d24889f763a8ce92583ed6f9925113d991ffe180db4e21fed8a8bd0776a7e13aa2857288167cbcabfbd9700"
const GuardianAuthProof9 = "0x" + "a0b245b2b0268de4fbe856c6b5e601bcac27bab300a5da267c08fbd0dfae1cd852414a957f64ee5ae0f4b8906d8c9a77a89d82fcb249b1b9909dfcba3d4daf2101"

contract("ShutdownSwitch", function () {
    const testChainId = "2";
    const testGovernanceChainId = "1";
    const testGovernanceContract = "0x0000000000000000000000000000000000000000000000000000000000000004";

    it("ganache config should be what we expect", async function () {
        const accounts = await web3.eth.getAccounts();
        assert.equal(accounts[9], EthPublicKey)
    })

    it("should correctly decode our auth proofs", async function () {
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);

        assert.equal((await initialized.methods.decodeVoter(EthPublicKey, GuardianAuthProof0).call()), GuardianPublicKey0)
        assert.equal((await initialized.methods.decodeVoter(EthPublicKey, GuardianAuthProof1).call()), GuardianPublicKey1)
        assert.equal((await initialized.methods.decodeVoter(EthPublicKey, GuardianAuthProof2).call()), GuardianPublicKey2)
        assert.equal((await initialized.methods.decodeVoter(EthPublicKey, GuardianAuthProof3).call()), GuardianPublicKey3)
        assert.equal((await initialized.methods.decodeVoter(EthPublicKey, GuardianAuthProof9).call()), GuardianPublicKey9)
    }) 
    
    // Set up to have four guardians for all of our tests.
    it("should upgrade to four guardians", async function () {
        // Create a guardian set of four, which will require two disable votes to suspend transfers.
        const wormhole = new web3.eth.Contract(WormholeImplementationFullABI, Wormhole.address);

        const timestamp = 1000;
        const nonce = 1001;
        const emitterChainId = testGovernanceChainId;
        const emitterAddress = testGovernanceContract
        let data = "0x00000000000000000000000000000000000000000000000000000000436f726502";
        let oldIndex = Number(await wormhole.methods.getCurrentGuardianSetIndex().call());

        data += [
            web3.eth.abi.encodeParameter("uint16", testChainId).substring(2 + (64 - 4)),
            web3.eth.abi.encodeParameter("uint32", oldIndex + 1).substring(2 + (64 - 8)),
            web3.eth.abi.encodeParameter("uint8", 4).substring(2 + (64 - 2)),
            web3.eth.abi.encodeParameter("address", GuardianPublicKey0).substring(2 + (64 - 40)),
            web3.eth.abi.encodeParameter("address", GuardianPublicKey1).substring(2 + (64 - 40)),
            web3.eth.abi.encodeParameter("address", GuardianPublicKey2).substring(2 + (64 - 40)),
            web3.eth.abi.encodeParameter("address", GuardianPublicKey3).substring(2 + (64 - 40)),
        ].join('')

        const vm = await signAndEncodeVM(
            timestamp,
            nonce,
            emitterChainId,
            emitterAddress,
            0,
            data,
            [
                testSigner1PK,
            ],
            0,
            2
        );

        let set = await wormhole.methods.submitNewGuardianSet("0x" + vm).send({
            value: 0,
            from: EthPublicKey,
            gasLimit: 1000000
        });
    })
    
    //////////////// NOTE: Every test after this assumes four guardians! ///////////////////////////////
    
    it("should start out with transfers enabled", async function () {
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);

        assert.equal((await initialized.methods.enabledFlag().call()), true)
        assert.equal((await initialized.methods.numVotesToShutdown().call()), 0)

        // Since we start out with only one guardian, the required votes should be one.
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
    })
    
    it("should reject a vote from a guardian that is not active", async function () {
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);

        // Cast a vote using a valid auth proof but for a non-active guardian, and it should fail.
        let voteFailed = false;
        try {
            await initialized.methods.castShutdownVote(GuardianAuthProof9, false).send({ from: EthPublicKey });
        } catch (error) {
            assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert you are not a registered voter")
            voteFailed = true
        }

        assert.ok(voteFailed)
        assert.equal((await initialized.methods.enabledFlag().call()), true)
        assert.equal((await initialized.methods.numVotesToShutdown().call()), 0)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
    })
        
    it("should reject a vote cast using the wrong wallet", async function () {
        const accounts = await web3.eth.getAccounts();
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);

        // Cast a vote using a valid auth proof but for a non-active guardian, and it should fail.
        let voteFailed = false;
        try {
            await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: accounts[0] });
        } catch (error) {
            assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert you are not a registered voter")
            voteFailed = true
        }

        assert.ok(voteFailed)
        assert.equal((await initialized.methods.enabledFlag().call()), true)
        assert.equal((await initialized.methods.numVotesToShutdown().call()), 0)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
    })

    it("should take three guardian votes to disable transfers", async function () {
        const accounts = await web3.eth.getAccounts();
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);
        await clearAllVotes(initialized);
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // This first vote should succeed, but we should still be enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // A duplicate vote should change nothing.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // The second vote should succeed, but we should still be enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof1, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 2)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // But a third vote should suspend transfers.
        await initialized.methods.castShutdownVote(GuardianAuthProof2, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), false)
    })

    let vaa = null;

    it("should reject transfers when they are disabled", async function () {
        const accounts = await web3.eth.getAccounts();
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);
        await clearAllVotes(initialized);
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // Set up, mint and approve tokens.
        const token = new web3.eth.Contract(TokenImplementation.abi, TokenImplementation.address);
        await token.methods.initialize(
            "TestToken",
            "TT",
            18,
            0,

            accounts[0],

            0,
            "0x0"
        ).send({
            value: 0,
            from: accounts[0],
            gasLimit: 2000000
        });

        const amount = "1000000000000000000";

        await token.methods.mint(accounts[0], amount).send({
            value: 0,
            from: accounts[0],
            gasLimit: 2000000
        });

        await token.methods.approve(TokenBridge.address, amount).send({
            value: 0,
            from: accounts[0],
            gasLimit: 2000000
        });

        // This transfer should succeed.
        await initialized.methods.transferTokens(
            TokenImplementation.address,
            "10000",
            "10",
            "0x000000000000000000000000b7a2211e8165943192ad04f5dd21bedc29ff003e",
            "0",
            "0"
        ).send({
            value: 0,
            from: accounts[0],
            gasLimit: 2000000
        });

        // Get the VAA from the successful transfer so we can try to redeem it.
        const wormhole = new web3.eth.Contract(WormholeImplementationFullABI, Wormhole.address);
        const log = (await wormhole.getPastEvents('LogMessagePublished', {
            fromBlock: 'latest'
        }))[0].returnValues
        vaa = log.payload.substr(2);

        // Cast three votes to disable transfers.

        // This first vote should succeed, but we should still be enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // A duplicate vote should change nothing.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // The second vote should succeed, but we should still be enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof1, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 2)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // But a third vote should suspend transfers.
        await initialized.methods.castShutdownVote(GuardianAuthProof2, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), false)

        // This transfer should be blocked.
        let transferShouldFail = false;
        try {
            await initialized.methods.transferTokens(
                TokenImplementation.address,
                "10000",
                "10",
                "0x000000000000000000000000b7a2211e8165943192ad04f5dd21bedc29ff003e",
                "0",
                "0"
            ).send({
                value: 0,
                from: accounts[0],
                gasLimit: 2000000
            });
        } catch (error) {
            assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert transfers are temporarily disabled")
            transferShouldFail = true
        }

        assert.ok(transferShouldFail)
    })

    it("a vote changing back to enabled should allow transfers again", async function () {
        const accounts = await web3.eth.getAccounts();
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);
        // Don't clear the votes here.

        // This assumes the previous test left us disabled.
        assert.equal((await initialized.methods.numVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), false)

        // Change one vote to enabled and our status should change back to enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, true).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 2)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // And now the transfer should go through.
        await initialized.methods.transferTokens(
            TokenImplementation.address,
            "10000",
            "10",
            "0x000000000000000000000000b7a2211e8165943192ad04f5dd21bedc29ff003e",
            "0",
            "0"
        ).send({
            value: 0,
            from: accounts[0],
            gasLimit: 2000000
        });
    })

    it("should reject redeems when they are disabled", async function () {
        // This test assumes the previous test initialized the vaa variable.
        assert.ok(vaa != null)

        const accounts = await web3.eth.getAccounts();
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);
        await clearAllVotes(initialized);
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // Redeem of this transfer should not be blocked by shutdown switch. It will instead fail with
        // "no quorum", but that's okay for this test, since that check happens after the enable check.
        try {
            await initialized.methods.completeTransfer("0x" + vaa).send({
                value: 0,
                from: accounts[0],
                gasLimit: 2000000
            })
        } catch (error) {
            assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert no quorum")
        }

        // Cast three votes to disable transfers.
        
        // This first vote should succeed, but we should still be enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // A duplicate vote should change nothing.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 1)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // The second vote should succeed, but we should still be enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof1, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 2)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // But a third vote should suspend transfers.
        await initialized.methods.castShutdownVote(GuardianAuthProof2, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), false)

        // This redeem should be blocked by shutdown switch rather than "no quorum".
        try {
            await initialized.methods.completeTransfer("0x" + vaa).send({
                value: 0,
                from: accounts[0],
                gasLimit: 2000000
            })
        } catch (error) {
            assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert transfers are temporarily disabled")
        }
    })

    it("a vote changing back to enabled should allow redeems again", async function () {
        const accounts = await web3.eth.getAccounts();
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);
        // Don't clear the votes here.

        // This assumes the previous test left us disabled.
        assert.equal((await initialized.methods.numVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), false)

        // Change one vote to enabled and our status should change back to enabled.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, true).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 2)
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // The redeem should be back to being blocked by "no quorum" rather than by shutdown switch.
        try {
            await initialized.methods.completeTransfer("0x" + vaa).send({
                value: 0,
                from: accounts[0],
                gasLimit: 2000000
            })
        } catch (error) {
            assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert no quorum")
        }
    })

    it("should return all who are voting to disable on query", async function () {
        // This test assumes the previous test initialized the vaa variable.
        assert.ok(vaa != null)

        const accounts = await web3.eth.getAccounts();
        const initialized = new web3.eth.Contract(BridgeImplementationFullABI, TokenBridge.address);
        await clearAllVotes(initialized);
        assert.equal((await initialized.methods.enabledFlag().call()), true)

        // Cast three votes to disable transfers.
        await initialized.methods.castShutdownVote(GuardianAuthProof0, false).send({ from: EthPublicKey });
        await initialized.methods.castShutdownVote(GuardianAuthProof1, false).send({ from: EthPublicKey });
        await initialized.methods.castShutdownVote(GuardianAuthProof2, false).send({ from: EthPublicKey });

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.requiredVotesToShutdown().call()), 3)
        assert.equal((await initialized.methods.enabledFlag().call()), false)

        let voters = await initialized.methods.currentVotesToShutdown().call();

        assert.equal(voters.length, 3);

        assert.equal(voters[0], GuardianPublicKey0);
        assert.equal(voters[1], GuardianPublicKey1);
        assert.equal(voters[2], GuardianPublicKey2);
    })

    async function clearAllVotes(initialized) {
        await initialized.methods.castShutdownVote(GuardianAuthProof0, true).send({ from: EthPublicKey })
        await initialized.methods.castShutdownVote(GuardianAuthProof1, true).send({ from: EthPublicKey })
        await initialized.methods.castShutdownVote(GuardianAuthProof2, true).send({ from: EthPublicKey })
        await initialized.methods.castShutdownVote(GuardianAuthProof3, true).send({ from: EthPublicKey })

        assert.equal((await initialized.methods.numVotesToShutdown().call()), 0)
        assert.equal((await initialized.methods.enabledFlag().call()), true)
    }
});

const signAndEncodeVM = async function (
    timestamp,
    nonce,
    emitterChainId,
    emitterAddress,
    sequence,
    data,
    signers,
    guardianSetIndex,
    consistencyLevel
) {
    const body = [
        web3.eth.abi.encodeParameter("uint32", timestamp).substring(2 + (64 - 8)),
        web3.eth.abi.encodeParameter("uint32", nonce).substring(2 + (64 - 8)),
        web3.eth.abi.encodeParameter("uint16", emitterChainId).substring(2 + (64 - 4)),
        web3.eth.abi.encodeParameter("bytes32", emitterAddress).substring(2),
        web3.eth.abi.encodeParameter("uint64", sequence).substring(2 + (64 - 16)),
        web3.eth.abi.encodeParameter("uint8", consistencyLevel).substring(2 + (64 - 2)),
        data.substr(2)
    ]

    const hash = web3.utils.soliditySha3(web3.utils.soliditySha3("0x" + body.join("")))

    let signatures = "";

    for (let i in signers) {
        const ec = new elliptic.ec("secp256k1");
        const key = ec.keyFromPrivate(signers[i]);
        const signature = key.sign(hash.substr(2), {canonical: true});

        const packSig = [
            web3.eth.abi.encodeParameter("uint8", i).substring(2 + (64 - 2)),
            zeroPadBytes(signature.r.toString(16), 32),
            zeroPadBytes(signature.s.toString(16), 32),
            web3.eth.abi.encodeParameter("uint8", signature.recoveryParam).substr(2 + (64 - 2)),
        ]

        signatures += packSig.join("")
    }

    const vm = [
        web3.eth.abi.encodeParameter("uint8", 1).substring(2 + (64 - 2)),
        web3.eth.abi.encodeParameter("uint32", guardianSetIndex).substring(2 + (64 - 8)),
        web3.eth.abi.encodeParameter("uint8", signers.length).substring(2 + (64 - 2)),

        signatures,
        body.join("")
    ].join("");

    return vm
}

function zeroPadBytes(value, length) {
    while (value.length < 2 * length) {
        value = "0" + value;
    }
    return value;
}
