module.exports = function (RED) {
    function ConditionTaskNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;

        // Parse conditions if they are a string
        let conditions = [];
        try {
            conditions = typeof config.conditions === "string" 
                ? JSON.parse(config.conditions) 
                : config.conditions || [];
        } catch (err) {
            node.error(`Failed to parse conditions: ${err.message}`);
            return;
        }

        // Handle empty or invalid conditions
        if (!Array.isArray(conditions) || conditions.length === 0) {
            node.error("No valid conditions provided.");
            return;
        }

        node.on("input", function (msg) {
            try {
                let allConditionsMet = true;
                let anyConditionMatched = false;

                console.log("Evaluating conditions:", conditions);

                // Evaluate each condition
                for (const condition of conditions) {
                    console.log("Each Condition:", ...condition);
                    const { property, operator, parameter } = condition;
                    console.log(property, operator, parameter);

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
