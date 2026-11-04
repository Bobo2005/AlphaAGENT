#[test_only]
module alphaagent::commits_tests {
    use sui::clock;
    use sui::test_scenario as ts;
    use alphaagent::commits::{Self, PickCommitted};

    #[test]
    fun test_commit_emits_event_successfully() {
        let user = @0xA11CE;
        let mut scenario = ts::begin(user);

        // Create mock clock at timestamp 1730300000 ms
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1730300000);

        // Dummy SHA-256 hash
        let dummy_hash = b"0123456789abcdef0123456789abcdef";

        // Execute commit
        commits::commit(dummy_hash, &clock, ts::ctx(&mut scenario));

        // Clean up clock and test scenario
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}

