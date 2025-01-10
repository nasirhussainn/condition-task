module.exports = function (RED) {
    function SimpleTaskNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;

        node.on("input", function (msg) {
            const nameValue = RED.util.getMessageProperty(msg, "payload.name");
            const ageValue = RED.util.getMessageProperty(msg, "payload.age");

            let nameCondition = false;
            let ageCondition = false;

            // Evaluate name condition
            switch (config.operatorName) {
                case "==":
                    nameCondition = nameValue == config.parameterName;
                    break;
                case "!=":
                    nameCondition = nameValue != config.parameterName;
                    break;
            }

            // Evaluate age condition
            switch (config.operatorAge) {
                case "==":
                    ageCondition = ageValue == config.parameterAge;
                    break;
                case "!=":
                    ageCondition = ageValue != config.parameterAge;
                    break;
            }

            // Output logic
            if (nameCondition && ageCondition) {
                node.send([msg, null, null]); // All conditions met
            } else if (nameCondition || ageCondition) {
                node.send([null, msg, null]); // Any condition met
            } else {
                node.send([null, null, msg]); // No condition met
            }
        });
    }

    RED.nodes.registerType("simple-task", SimpleTaskNode);
};
