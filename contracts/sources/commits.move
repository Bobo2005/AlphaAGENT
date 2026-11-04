module alphaagent::commits {
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::tx_context::{Self, TxContext};

    /// Event emitted whenever a forecaster cryptographically commits a pick hash
    public struct PickCommitted has copy, drop {
        forecaster: address,
        commit_hash: vector<u8>,
        committed_at_ms: u64,
    }

    /// Single entry point for committing a pick hash
    public entry fun commit(
        commit_hash: vector<u8>,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        event::emit(PickCommitted {
            forecaster: tx_context::sender(ctx),
            commit_hash,
            committed_at_ms: clock::timestamp_ms(clock),
        });
    }

    #[test_only]
    public fun unpack_for_test(e: &PickCommitted): (address, vector<u8>, u64) {
        (e.forecaster, e.commit_hash, e.committed_at_ms)
    }
}

