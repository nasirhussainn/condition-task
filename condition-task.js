module.exports = function (RED) {
    function ConditionTaskNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        const conditions = config.conditions || []; // Retrieve the conditions array

        node.on("input", function (msg) {
            try {
                let allConditionsMet = true;
                let anyConditionMatched = false;

                // Evaluate each condition
                for (const condition of conditions) {
                    const { property, operator, parameter } = condition;

                    // Retrieve the value of the property from the message payload
                    const value = RED.util.getMessageProperty(msg, `payload.${property}`);

                    let conditionResult = false;
                    switch (operator) {
                        case "==":
                            conditionResult = value == parameter;
                            break;
                        case "!=":
                            conditionResult = value != parameter;
                            break;
                        default:
                            node.error(`Unsupported operator: ${operator}`);
                            return;
                    }

                    // Update match flags
                    if (conditionResult) {
                        anyConditionMatched = true;
                    } else {
                        allConditionsMet = false;
                    }
                }

                // Output decision
                if (allConditionsMet) {
                    node.send([msg, null, null]); // Output 1
                } else if (anyConditionMatched) {
                    node.send([null, msg, null]); // Output 2
                } else {
                    node.send([null, null, msg]); // Output 3
                }
            } catch (err) {
                node.error(`Error evaluating conditions: ${err.message}`);
            }
        });
    }

    RED.nodes.registerType("condition-task", ConditionTaskNode);
};
