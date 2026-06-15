console.log(
    "PLANGENIE INDEX RUNNING"
);

const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

const {
    getFinancialPersonality
} = require("./data/profiling/personality");

const {
    calculateSavingRate
} = require("./data/profiling/saving-rate");

const {
    calculateFinancialCondition
} = require("./data/profiling/financial-condition");

const {
    calculateRiskProfile
} = require("./data/profiling/risk-profile");

const {
    generateRecommendations
} = require("./data/profiling/recommendation");

const express = require("express");
const fs = require("fs");
const path = require("path");

const db = require("./services/database");
const options =
require("./data/dialogflow-options");
const app = express();

app.use(express.json());

const sessionClient =
new dialogflow.SessionsClient({
    keyFilename:
    "./invesion-qclp-966c7fbb29ae.json"
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );

});
app.get("/test-db", async (req,res)=>{

    try{

        const [rows] =
        await db.query(
            "SELECT 1 AS test"
        );

        res.json({
            success:true,
            database:"connected",
            result:rows
        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

});
// ================= GET TOPICS =================

app.get("/topics", (req,res)=>{

    const folder =
    path.join(__dirname,"data/topics");

    const files =
    fs.readdirSync(folder);

    const topics = files.map(file=>{

        const data =
        fs.readFileSync(
            path.join(folder,file),
            "utf-8"
        );

        return JSON.parse(data);

    });

    res.json(topics);

});

// ================= GET SINGLE TOPIC =================

app.get("/topics/:id",(req,res)=>{

    const id = req.params.id;

    const filePath =
    path.join(
        __dirname,
        "data/topics",
        `topic${id}.json`
    );

    if(!fs.existsSync(filePath)){

        return res.status(404).json({
            message:"Topic tidak ditemukan"
        });

    }

    const data =
    fs.readFileSync(filePath,"utf-8");

    res.json(JSON.parse(data));

});

app.get(
    "/help/:topicId/:moduleId",
    (req,res)=>{

        const filePath =
        path.join(

            __dirname,

            "data/help",

            `help_topic${req.params.topicId}_module${req.params.moduleId}.json`

        );

        if(!fs.existsSync(filePath)){

            return res.status(404).json({
                message:"Help tidak ditemukan"
            });

        }

        const data =
        fs.readFileSync(
            filePath,
            "utf-8"
        );

        res.json(
            JSON.parse(data)
        );

    }
);

// ================= GET QUIZ =================

app.get("/quiz/:file",(req,res)=>{

    const file =
    req.params.file;

    const filePath =
    path.join(
        __dirname,
        "data/quizzes",
        file
    );

    if(!fs.existsSync(filePath)){

        return res.status(404).json({
            message:"Quiz tidak ditemukan"
        });

    }

    const data =
    fs.readFileSync(
        filePath,
        "utf-8"
    );

    res.json(JSON.parse(data));

});

// ================= GET RECOMMENDATION =================

app.get("/recommendation/:file",(req,res)=>{

    const file =
    req.params.file;

    const filePath =
    path.join(
        __dirname,
        "data/recommendations",
        file
    );

    if(!fs.existsSync(filePath)){

        return res.status(404).json({
            message:"Recommendation tidak ditemukan"
        });

    }

    const data =
    fs.readFileSync(
        filePath,
        "utf-8"
    );

    res.json(JSON.parse(data));

});

app.post("/api/profiling", async (req,res)=>{

    try{

        const data = req.body;

        console.log(
            "DATA PROFILING:",
            data
        );

        const personality =
        getFinancialPersonality(
            data.lifestyle,
            data.savingHabit,
            data.investmentExperience,
            data.expenseFocus
        );

        const savingRate =
        calculateSavingRate(data);

        const financialCondition =
        calculateFinancialCondition(
            data,
            savingRate.condition
        );

        const riskProfile =
        calculateRiskProfile(data);

        const result = {

            personality,

            savingRate,

            financialCondition,

            riskProfile

        };

        const recommendations =
        generateRecommendations(
            data,
            result
        );
        console.log(
            "INSERT DATA:",
        data
        );

        const [answerResult] =
        await db.query(

            `INSERT INTO profiling_answers (

                user_id,
                age_range,
                marital_status,
                income_range,
                side_income_status,
                extra_income_range,
                expense_percentage,
                expense_focus,
                saving_amount,
                investment_experience,
                home_ownership,
                expense_recording,
                saving_habit,
                lifestyle_type,
                retirement_age,
                retirement_expense,
                expense_reduction,
                saving_problem

            )

            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,

            [

                data.userId,
                data.ageRange,
                data.maritalStatus,
                data.incomeRange,
                data.sideIncomeStatus,
                data.extraIncomeRange,
                data.expensePercentage,
                data.expenseFocus,
                data.savingAmount,
                data.investmentExperience,
                data.homeOwnership,
                data.expenseRecording,
                data.savingHabit,
                data.lifestyle,
                data.retirementAge,
                data.retirementExpense,
                data.expenseReduction,
                data.savingProblem

            ]

        );

        const [profilingResult] =
        await db.query(

            `INSERT INTO profiling_results (

                user_id,
                personality,
                saving_rate,
                financial_condition,
                risk_profile

            )

            VALUES (?,?,?,?,?)`,

            [

                data.userId,
                personality,
                savingRate.condition,
                financialCondition.condition,
                riskProfile.profile

            ]

        );

        const profilingResultId =
        profilingResult.insertId;

        for(
            let i = 0;
            i < recommendations.length;
            i++
        ){

            await db.query(

                `INSERT INTO recommendations (

                    profiling_result_id,
                    recommendation_text,
                    priority

                )

                VALUES (?,?,?)`,

                [

                    profilingResultId,
                    recommendations[i],
                    i + 1

                ]

            );

        }

        res.json({

            success:true,

            personality,

            savingRate,

            financialCondition,

            riskProfile,

            recommendations

        });

    }

   catch(error){

    console.error(
        "PROFILING ERROR:"
    );

    console.error(error);

    res.status(500).json({

        success:false,
        error:error.message

    });

}

});

app.post("/chat", async (req,res)=>{

    try{

        const message =
        req.body.message;

        const sessionId =
        req.body.sessionId ||
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

                    text: message,

                    languageCode: "id"

                }

            }

        };

        const responses =
        await sessionClient.detectIntent(
            request
        );

        const result =
        responses[0].queryResult;

        let currentContext = null;

        if(
            result.outputContexts &&
            result.outputContexts.length > 0
        ){

            const activeContexts =
            result.outputContexts.map(c =>
                c.name.split("/").pop()
            );

            console.log(
                "Contexts:",
                activeContexts
            );

            if(
                activeContexts.includes(
                    "generate_financial_analysis"
                )
            ){

                currentContext =
                "generate_financial_analysis";

            }

            else{

                currentContext =
                activeContexts.find(
                    context =>
                    options[context]
                ) || null;

            }

        }

        // ================= GENERATE ANALYSIS =================

        if(
            currentContext ===
            "generate_financial_analysis"
        ){

            return res.json({

                sessionId,

                text:
                result.fulfillmentText,

                intent:
                result.intent
                ? result.intent.displayName
                : null,

                parameters:
                result.parameters,

                context:
                currentContext,

                generateAnalysis:true

            });

        }

        // ================= NORMAL RESPONSE =================

        res.json({

            sessionId,

            text:
            result.fulfillmentText,

            intent:
            result.intent
            ? result.intent.displayName
            : null,

            parameters:
            result.parameters,

            context:
            currentContext,

            options:
            options[currentContext] || []

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:
            "Dialogflow Error"

        });

    }

});
app.get("/test-chat", async (req,res)=>{

    const sessionPath =
    sessionClient.projectAgentSessionPath(
        "invesion-qclp",
        "test-session"
    );

    const request = {

        session: sessionPath,

        queryInput: {

            text: {

                text: "Check Personality!",

                languageCode: "id"

            }

        }

    };

    const responses =
    await sessionClient.detectIntent(
        request
    );

    res.json(
        responses[0].queryResult
    );

});
app.post("/login", async (req,res)=>{

    try{

        const {
            email,
            password
        } = req.body;

        const [users] =
        await db.query(

            `SELECT * FROM users
            WHERE email=?`,

            [email]

        );

        if(users.length === 0){

            return res.status(400).json({

                success:false,
                message:"Email tidak ditemukan"

            });

        }

        const user =
        users[0];

        if(
            user.password !== password
        ){

            return res.status(400).json({

                success:false,
                message:"Password salah"

            });

        }

        res.json({

            success:true,
            message:"Login berhasil",

            user:{
                id:user.id,
                full_name:user.full_name,
                email:user.email
            }

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,
            error:error.message

        });

    }

});
app.post("/register", async (req,res)=>{

    try{

        const {
            full_name,
            email,
            password
        } = req.body;

        const [existing] =
        await db.query(
            "SELECT id FROM users WHERE email=?",
            [email]
        );

        if(existing.length > 0){

            return res.status(400).json({
                success:false,
                message:"Email sudah digunakan"
            });

        }

        await db.query(

            `INSERT INTO users
            (full_name,email,password)
            VALUES (?,?,?)`,

            [
                full_name,
                email,
                password
            ]

        );

        res.json({
            success:true,
            message:"Register berhasil"
        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

});
app.get("/users-test", async (req,res)=>{

    const [rows] =
    await db.query(
        "SELECT * FROM users"
    );

    res.json(rows);

});
app.get("/api/personality-report/:userId", async (req,res)=>{

    try{

        const userId =
        req.params.userId;

        const [results] =
        await db.query(

            `SELECT *
            FROM profiling_results
            WHERE user_id=?
            ORDER BY created_at DESC
            LIMIT 1`,

            [userId]

        );

        if(results.length === 0){

            return res.status(404).json({

                success:false,
                message:"Data tidak ditemukan"

            });

        }

        const report =
        results[0];

        const [recommendations] =
        await db.query(

            `SELECT recommendation_text
            FROM recommendations
            WHERE profiling_result_id=?
            ORDER BY priority ASC`,

            [report.id]

        );

        res.json({

            success:true,

            report,

            recommendations:
            recommendations.map(
                item =>
                item.recommendation_text
            )

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,
            error:error.message

        });

    }

});

app.post("/api/simulation", async (req,res)=>{

    console.log("SIMULATION HIT");
    console.log(req.body);

    try{

        const {
            userId,
            targetName,
            targetAmount,
            targetYear,
            monthlyInvestment,
            expectedReturn,
            result
        } = req.body;

        await db.execute(
            `INSERT INTO simulations
            (
                user_id,
                target_name,
                target_amount,
                target_year,
                monthly_investment,
                expected_return,
                result
            )
            VALUES (?,?,?,?,?,?,?)`,
            [
                userId,
                targetName,
                targetAmount,
                targetYear,
                monthlyInvestment,
                expectedReturn,
                result
            ]
        );

        res.json({
            success:true
        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            success:false
        });

    }

});

app.post("/api/learning-progress", async (req,res)=>{

    try{

        const {
            userId,
            materialName,
            status
        } = req.body;

        await db.execute(
            `INSERT INTO learning_progress
            (
                user_id,
                material_name,
                status,
                completed_at
            )
            VALUES (?,?,?,NOW())`,
            [
                userId,
                materialName,
                status
            ]
        );

        res.json({
            success:true
        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            success:false
        });

    }

});

app.post("/api/chat-history", async (req,res)=>{

    try{

        const {
            userId,
            role,
            message
        } = req.body;

        await db.execute(
            `INSERT INTO chatbot_history
            (
                user_id,
                role,
                message
            )
            VALUES (?,?,?)`,
            [
                userId,
                role,
                message
            ]
        );

        res.json({
            success:true
        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            success:false
        });

    }

});

app.post("/api/quiz-attempt", async (req,res)=>{

    try{

        const {
            userId,
            materialName,
            score,
            totalQuestion,
            passed,
            answers
        } = req.body;

        const [attemptResult] =
        await db.execute(
            `INSERT INTO quiz_attempts
            (
                user_id,
                material_name,
                score,
                total_question,
                passed
            )
            VALUES (?,?,?,?,?)`,
            [
                userId,
                materialName,
                score,
                totalQuestion,
                passed
            ]
        );

        const attemptId =
        attemptResult.insertId;

        if(
            answers &&
            answers.length > 0
        ){

            for(
                const answer of answers
            ){

                await db.execute(
                    `INSERT INTO quiz_answers
                    (
                        attempt_id,
                        question,
                        user_answer,
                        correct_answer,
                        is_correct
                    )
                    VALUES (?,?,?,?,?)`,
                    [
                        attemptId,
                        answer.question,
                        answer.userAnswer,
                        answer.correctAnswer,
                        answer.isCorrect
                    ]
                );

            }

        }

        res.json({
            success:true
        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            success:false
        });

    }

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server berjalan pada port ${PORT}`
    );

});

console.log(
    "SERVER FILE LOADED"
);