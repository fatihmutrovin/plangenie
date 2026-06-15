const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

const sessionClient =
new dialogflow.SessionsClient({
    keyFilename:
    "./invesion-qclp-966c7fbb29ae.json"
});

async function test(){

    const sessionId =
    uuid.v4();

    const sessionPath =
    sessionClient.projectAgentSessionPath(
        "invesion-qclp",
        sessionId
    );

    const request = {

        session: sessionPath,

        queryInput: {

            text: {

                text: "halo",

                languageCode: "id"

            }

        }

    };

    const responses =
    await sessionClient.detectIntent(
        request
    );

    console.log(
        responses[0]
        .queryResult
        .fulfillmentText
    );

}

test();