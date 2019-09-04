import { reaction }  from 'mobx';
import TradingTimes  from './trading-times';
import ContractsFor  from './contracts-for';
import ActiveSymbols from './active-symbols';

class ApiHelpers {
    static singleton = null;

    constructor(root_store) {
        this.root_store     = root_store;
        this.trading_times  = new TradingTimes(this.root_store);
        this.contracts_for  = new ContractsFor(this.root_store);
        this.active_symbols = new ActiveSymbols(this.root_store, this.trading_times);

        // Account switching, this is temp. implementation. (TODO)
        // Purges active_symbols + contracts_for on account switch.
        const { client } = this.root_store.core;
        
        reaction(
            () => client.switch_broadcast,
            (switch_broadcast) => {
                if (!switch_broadcast) {
                    return;
                }

                const { derivWorkspace: workspace } = Blockly;

                if (workspace) {
                    this.active_symbols.retrieveActiveSymbols(true).then(() => {
                        this.contracts_for.disposeCache();
                        workspace.getAllBlocks()
                            .filter(block => block.type === 'trade_definition_market')
                            .forEach(block => {
                                const fake_create_event = new Blockly.Events.Create(block);
                                Blockly.Events.fire(fake_create_event);
                            });
    
                        client.switchEndSignal();
                    });
                }
            }
        );

    }

    static setInstance(root_store) {
        if (!this.singleton) {
            this.singleton = new ApiHelpers(root_store);
        }
        
        return this.instance;
    }

    static get instance() {
        return this.singleton;
    }
}

export default ApiHelpers;
