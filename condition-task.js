module.exports = function (RED) {
    function ConditionTaskNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;

        const conditions = config.items || [];

        console.log("Conditions:", conditions);

        node.on("input", function (msg) {
            try {
                let allConditionsMet = true;
                let anyConditionMatched = false;

                console.log("Evaluating conditions:", conditions);

                // Evaluate each condition
                for (const condition of conditions) {
                    if (typeof condition === "string" && condition.length > 0) {
                        console.log("Condition part:", condition[0]);
                        console.log("Condition:", condition);
                        console.log(JSON.stringify(condition).toString())
                        console.log("Condition after stringify:", condition);
                        try {
                            console.log("Condition part:", condition[0], condition.val());
                            console.log("Condition:", condition);
                            console.log(JSON.stringify(condition).toString())
                            console.log("Condition after stringify:", condition);
                            // condition = JSON.parse(condition).toString(); // Parse if it's a string
                        } catch (err) {
                            node.error("Failed to parse condition:", err);
                            continue;
                        }
                    }
                    else{
                        if(condition.length === 0)
                        {
                        console.log("Condition has 0 length:", condition);
                        }
                        else{
                            console.log("Condition is not a string:", condition);
                        }
                    }
                    console.log("Each Condition:", condition);

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
