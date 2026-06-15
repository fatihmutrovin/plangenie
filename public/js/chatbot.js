const chatWrapper =
document.getElementById("chatWrapper");

const chatBody =
document.getElementById("chatBody");

let userName = "";

let selectedTopic = null;

let hasOpenedModule = false;

let recommendationQuestions = [];

let selectedMaterial = null;

let quizAnswers = [];

let currentQuiz = 0;

let score = 0;

let quizQuestions = [];

let sessionId = null;

let isProfilingMode = false;

let profilingData = {};
// ================= TIME =================

function getTime(){

    const now = new Date();

    return now.toLocaleTimeString([],{

        hour:'2-digit',
        minute:'2-digit'

    });

}

// ================= SCROLL =================

function scrollBottom(){

    setTimeout(()=>{

        chatBody.scrollTop =
        chatBody.scrollHeight;

    },100);

}

async function saveChatHistory(
    role,
    message
){

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    if(!user){
        return;
    }

    try{

        await fetch(
            "/api/chat-history",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    userId:user.id,

                    role,

                    message

                })

            }
        );

    }

    catch(error){

        console.error(error);

    }

}

async function sendToDialogflow(message){

    const response =
    await fetch("/chat",{

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            message,
            sessionId

        })

    });

    const data =
    await response.json();

    sessionId =
    data.sessionId;

    return data;

}
// ================= USER MESSAGE =================

function addUserMessage(text){

    const html = `

    <div class="message user">

        <div class="bubble">

            <p>${text}</p>

            <div class="time">
                ${getTime()}
            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    saveChatHistory(
        "user",
        text
    );

    scrollBottom();

}

// ================= BOT MESSAGE =================

function addBotMessage(text){

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div class="bubble">

            <p>${text}</p>

            <div class="time">
                ${getTime()}
            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    saveChatHistory(
        "assistant",
        text
    );

    scrollBottom();

}

// ================= START =================

window.onload = () => {

    showGreeting();

};

// ================= GREETING =================

function showGreeting(){

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div class="bubble">

            <p>

                Halo! 👋<br><br>

                Aku Genie,
                asisten keuangan pribadimu.

                <br><br>

                Aku di sini untuk membantu
                merencanakan masa depan
                finansial yang lebih baik.

                <br><br>

                Boleh tahu siapa namamu?

            </p>

            <div class="time">
                ${getTime()}
            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

// ================= SEND MESSAGE =================

function sendMessage(){

    const input =
    document.getElementById("messageInput");

    const text =
    input.value.trim();

    if(text === "") return;

    addUserMessage(text);

    input.value = "";
    if(isProfilingMode){

        handleProfilingMessage(text);

        return;

    }
    // ================= NAME FLOW =================

    if(userName === ""){

        userName = text;

        setTimeout(()=>{

            showMainMenu();

        },500);

        return;

    }

}
async function handleProfilingMessage(text){

    try{

        const data =
        await sendToDialogflow(
            text
        );

        addBotMessage(
            data.text
        );

        console.log(
            "Intent:",
            data.intent
        );

        console.log(
            "Parameters:",
            data.parameters
        );

        // =====================
        // SIMPAN PARAMETER DULU
        // =====================

        if(
            data.parameters &&
            data.parameters.fields
        ){

            Object.keys(
                data.parameters.fields
            ).forEach(key=>{

                const field =
                data.parameters.fields[key];

                if(
                    field.stringValue !== undefined &&
                    field.stringValue !== ""
                ){

                    profilingData[key] =
                    field.stringValue;

                }

                if(
                    field.numberValue !== undefined
                ){

                    profilingData[key] =
                    field.numberValue;

                }

                if(
                    field.listValue &&
                    field.listValue.values &&
                    field.listValue.values.length > 0
                ){

                    const value =
                    field.listValue.values[0];

                    profilingData[key] =
                    value.stringValue ||
                    value.numberValue;

                }

            });

        }

        console.log(
            "Profiling Data:",
            profilingData
        );

        console.log(
            "Context:",
            data.context
        );

        // =====================
        // TAMPILKAN OPTIONS
        // =====================

        if(
            data.options &&
            data.options.length > 0
        ){

            showOptions(
                data.options
            );

        }

        // =====================
        // GENERATE ANALYSIS
        // =====================

        if(
            data.generateAnalysis
        ){

            addBotMessage(
                "📊 Sedang menghitung hasil profiling..."
            );

            await generateFinancialAnalysis();

        }

    }

    catch(error){

        console.error(error);

        addBotMessage(
            "Terjadi kesalahan saat memproses profiling."
        );

    }

}
// ================= MAIN MENU =================

function showMainMenu(){

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    Halo ${userName}!
                    Senang bertemu denganmu 😊

                    <br><br>

                    Aku bisa bantu kamu
                    dalam 2 hal:

                    <br><br>

                    📘 Belajar perencanaan keuangan

                    <br><br>

                    👤 Analisis kondisi finansial
                    (profiling)

                    <br><br>

                    Kamu mau mulai dari mana?

                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <div class="option-buttons">

                <button
                class="option-btn"
                onclick="startLearning()">

                    Belajar

                </button>

                <button
                class="option-btn"
                onclick="startProfiling()">

                    Profiling

                </button>

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}
async function startProfiling(){

    closeQuickActionMenu();
    
    isProfilingMode = true;

    addUserMessage("Profiling");

    try{

        const data =
        await sendToDialogflow(
            "Check Personality!"
        );

        addBotMessage(
            data.text
        );

    }

    catch(error){

        console.error(error);

        addBotMessage(
            "Gagal terhubung ke sistem profiling."
        );

    }

}
function showOptions(options){

    let html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div class="option-buttons">

    `;

    options.forEach(option=>{

        html += `

        <button
        class="option-btn"
        onclick="
            selectOption(
                '${option}'
            )
        ">

            ${option}

        </button>

        `;

    });

    html += `
        </div>
    </div>
    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

function selectOption(option){

    document
    .getElementById("messageInput")
    .value = option;

    sendMessage();

}
function getAgeRange(age){

    if(age < 20){

        return "under_20";

    }

    if(age <= 25){

        return "20_25";

    }

    if(age <= 30){

        return "26_30";

    }

    if(age <= 40){

        return "31_40";

    }

    return "over_40";

}
async function generateFinancialAnalysis(){
    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    
    const ageRange =
    getAgeRange(
        profilingData.number
    );

    console.log(
        "Current Age:",
        profilingData.number
    );

    console.log(
        "Age Range:",
        ageRange
    );
    console.log({

        current_age:
        profilingData.number,

        age_range:
        ageRange,

        marital_status:
        profilingData.marital_status,

        income_range:
        profilingData.income_range,

        expense_percentage:
        profilingData.expense_percentage

    });

    const response =
    await fetch(
        "/api/profiling",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                userId:user.id,

                ageRange:
                getAgeRange(
                    profilingData.number
                ),
                
                maritalStatus:
                profilingData.marital_status,
                
                incomeRange:
                profilingData.income_range,
                
                sideIncomeStatus:
                profilingData.side_income_status,
                
                extraIncomeRange:
                profilingData.extra_income_range,
                
                expensePercentage:
                profilingData.expense_percentage,
                
                expenseFocus:
                profilingData.expense_focus,
                
                savingAmount:
                profilingData.saving_amount,
                
                investmentExperience:
                profilingData.investment_experience,
                
                homeOwnership:
                profilingData.home_ownership,
                
                expenseRecording:
                profilingData.expense_recording,
                
                savingHabit:
                profilingData.saving_habit,
                
                lifestyle:
                profilingData.lifestyle_type,
                
                retirementAge:
                profilingData.retirement_age,
                
                retirementExpense:
                profilingData.retirement_expense,
                
                expenseReduction:
                profilingData.expense_reduction,
                
                savingProblem:
                profilingData.saving_problem
            
            })

        }
    );

    const finalProfilingData = {

    age: getAgeRange(
        profilingData.number
    ),

    maritalStatus:
    profilingData.marital_status,

    incomeRange:
    profilingData.income_range,

    sideIncomeStatus:
    profilingData.side_income_status,

    expensePercentage:
    profilingData.expense_percentage,

    expenseFocus:
    profilingData.expense_focus,

    savingAmount:
    profilingData.saving_amount,

    investmentExperience:
    profilingData.investment_experience,

    expenseRecording:
    profilingData.expense_recording,

    savingHabit:
    profilingData.saving_habit,

    lifestyle:
    profilingData.lifestyle_type,

    retirementAge:
    profilingData.retirement_age,

    retirementExpense:
    profilingData.retirement_expense,

    expenseReduction:
    profilingData.expense_reduction,

    savingProblem:
    profilingData.saving_problem

};

console.log(
    "FINAL DATA:",
    finalProfilingData
);

    const result =
    await response.json();

    localStorage.setItem(

        "personalityReport",

        JSON.stringify(result)

    );

    console.log(result);

    showReportCard();

}

function showReportCard(){

    const chatWrapper =
    document.getElementById(
        "chatWrapper"
    );

    const card =
    document.createElement(
        "div"
    );

    card.className =
    "report-card";

    card.innerHTML = `

        <div class="report-result-card">

            <div class="report-icon">

                <img
                src="report.png"
                alt="Report">

            </div>

            <h3>

                Analisis personal kamu sudah siap!

            </h3>

            <p>

                Dapatkan insight lengkap dan rekomendasi awal berdasarkan hasil profiling.

            </p>

            <button
            class="report-btn"
            onclick="openReport()">

                <span>
                    Lihat Personality Report
                </span>

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>

    `;

    chatWrapper.appendChild(
        card
    );

    chatWrapper.scrollTop =
    chatWrapper.scrollHeight;

}

function openReport(){

    window.location.href =
    "personality-report.html";

}


// ================= START LEARNING =================

async function startLearning(){
    closeQuickActionMenu();

    addUserMessage("Belajar");

    const response =
    await fetch("/topics");

    const topics =
    await response.json();

    let topicHTML = "";

    topics.forEach(topic=>{

        topicHTML += `

        <button
        class="option-card"
        onclick="openTopic(${topic.id})">

            <div style="
                font-size:20px;
                font-weight:700;
                color:#2454d3;
                margin-bottom:8px;
            ">

                ${topic.title}

            </div>

            <div style="
                color:#7a7a7a;
                line-height:1.8;
            ">

                ${topic.subtitle}

            </div>

        </button>

        `;

    });

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    Bagus, ${userName}! 🎉

                    <br><br>

                    Mari kita mulai
                    perjalanan belajarmu.

                    <br><br>

                    Pilih topik yang ingin
                    kamu pelajari:

                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <div class="option-buttons">

                ${topicHTML}

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

// ================= OPEN TOPIC =================

async function openTopic(topicId){

    const response =
    await fetch(`/topics/${topicId}`);

    const topic =
    await response.json();

    selectedTopic = topic;

    addUserMessage(topic.title);

    let moduleHTML = "";

    topic.materials.forEach(material=>{

        moduleHTML += `

        <button
        class="option-card"
        onclick="
            openModule(
                ${topic.id},
                ${material.id}
            )
        ">

            <div style="
                color:#7c8ab8;
                font-size:13px;
                margin-bottom:6px;
            ">

                Modul ${material.id}

            </div>

            <div style="
                font-size:20px;
                font-weight:700;
                color:#2454d3;
                margin-bottom:8px;
            ">

                ${material.title}

            </div>

            <div style="
                color:#666;
                line-height:1.8;
            ">

                ${material.description}

            </div>

        </button>

        `;

    });

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    Baik ${userName}!
                    Kamu mau materi mana
                    yang ingin kamu pelajari?

                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <div class="option-buttons">

                ${moduleHTML}

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

// ================= OPEN MODULE =================

async function openModule(
    topicId,
    materialId
){

    const response =
    await fetch(`/topics/${topicId}`);

    const topic =
    await response.json();

    const material =
    topic.materials.find(
        m => m.id == materialId
    );
    selectedMaterial = material;

    addUserMessage(
        `Pilih ${material.title}`
    );

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <!-- INTRO -->

            <div class="bubble">

                <p>

                    Baik ${userName}!

                    Kita akan belajar:

                    <br><br>

                    Silakan pelajari modul berikut terlebih dahulu.

                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <!-- PDF BUTTON -->

            <button
            class="option-card"
            onclick="
                openPdfModule(
                    '${material.file}'
                )
            "
            style="
                margin-top:15px;
                text-align:left;
            ">

                <div style="
                    color:#7c8ab8;
                    font-size:13px;
                    margin-bottom:6px;
                ">

                    Modul ${material.id}

                </div>

                <div style="
                    font-size:22px;
                    font-weight:700;
                    color:#2454d3;
                    margin-bottom:8px;
                ">

                    ${material.title}

                </div>

                <div style="
                    color:#666;
                    line-height:1.8;
                ">

                    ${material.description}

                </div>

            </button>

            <!-- LEARNING -->

            <div
            class="bubble"
            style="margin-top:18px;">

                <p>

                    Dalam modul ini,
                    kamu akan belajar tentang:

                    <br><br>

                    ${material.content
                    .map(item => `• ${item}`)
                    .join("<br>")}
                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>
            

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

function openPdfModule(file){

    window.open(
        file,
        '_blank'
    );

    hasOpenedModule = true;

    showReadButton();

}

function showReadButton(){

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    Setelah selesai membaca modul,
                    klik tombol berikut untuk lanjut 😊

                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <div class="option-buttons">

                <button
                class="option-btn"
                onclick="showLearningHelp()">

                    Saya Sudah Membaca

                </button>

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

function showLearningHelp(){

    addUserMessage(
        "Saya Sudah Membaca"
    );

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    Bagian mana yang ingin
                    kamu pelajari lebih lanjut?

                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <div class="option-buttons">

                <button
                class="option-btn"
                onclick="openHelpSection('Konsep Dasar')">

                    Konsep Dasar

                </button>

                <button
                class="option-btn"
                onclick="openHelpSection('Contoh Kasus')">

                    Contoh Kasus

                </button>

                <button
                class="option-btn"
                onclick="openHelpSection('Langkah Praktis')">

                    Langkah Praktis

                </button>

                <button
                class="option-btn"
                onclick="readyQuiz()">

                    Saya Siap Quiz

                </button>

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

async function openHelpSection(type){

    addUserMessage(type);

    const response =
    await fetch(

        `/help/${selectedTopic.id}/${selectedMaterial.id}`

    );

    const data =
    await response.json();

    let content = "";

    if(type === "Konsep Dasar"){

        content =
        data.concept.content;

    }

    if(type === "Contoh Kasus"){

        content =
        data.case.content;

    }

    if(type === "Langkah Praktis"){

        content =
        data.practice.content;

    }

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    ${content}

                </p>

                <div class="time">

                    ${getTime()}

                </div>

            </div>

            <div class="option-box">

                <h3>

                    Apa yang ingin kamu pelajari selanjutnya?

                </h3>

                <div class="option-buttons">

                    ${
                        type !== "Konsep Dasar"
                        ?
                        `
                        <button
                        class="option-btn"
                        onclick="
                            openHelpSection(
                                'Konsep Dasar'
                            )
                        ">
                            Konsep Dasar
                        </button>
                        `
                        :
                        ""
                    }

                    ${
                        type !== "Contoh Kasus"
                        ?
                        `
                        <button
                        class="option-btn"
                        onclick="
                            openHelpSection(
                                'Contoh Kasus'
                            )
                        ">
                            Contoh Kasus
                        </button>
                        `
                        :
                        ""
                    }

                    ${
                        type !== "Langkah Praktis"
                        ?
                        `
                        <button
                        class="option-btn"
                        onclick="
                            openHelpSection(
                                'Langkah Praktis'
                            )
                        ">
                            Langkah Praktis
                        </button>
                        `
                        :
                        ""
                    }

                    <button
                    class="option-btn"
                    onclick="readyQuiz()">

                        Saya Siap Quiz

                    </button>

                </div>

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

function toggleQuickActionMenu(){

    const menu =
    document.getElementById(
        "quickActionMenu"
    );

    menu.classList.toggle(
        "active"
    );

}

function closeQuickActionMenu(){

    document
    .getElementById(
        "quickActionMenu"
    )
    .classList.remove(
        "active"
    );

}
// ================= ASK RECOMMENDATION =================

// ================= ASK RECOMMENDATION =================

// ================= ASK RECOMMENDATION =================

// ================= NOT UNDERSTAND =================

// ================= READY QUIZ =================

async function readyQuiz(){

    addUserMessage(
        "Saya Siap Quiz"
    );

    setTimeout(async()=>{

        addBotMessage(

            "Baik 😊<br><br>" +

            "Mari kita mulai quiz untuk " +

            "menguji pemahamanmu."

        );

        // ================= LOAD QUIZ =================

        const response =
        await fetch(
            `/quiz/${selectedMaterial.quizFile}`
        );

        const data =
        await response.json();

        quizQuestions =
        data.questions;

        currentQuiz = 0;

        score = 0;

        quizAnswers = [];

        showQuiz();

    },700);

}

// ================= SHOW QUIZ =================

function showQuiz(){

    const quiz =
    quizQuestions[currentQuiz];

    let optionsHTML = "";

    quiz.options.forEach((option,index)=>{

        optionsHTML += `

        <button
        class="option-card"
        onclick="
            answerQuiz(${index})
        ">

            ${option}

        </button>

        `;

    });

    const progress =
    (
        (currentQuiz + 1)
        /
        quizQuestions.length
    ) * 100;

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    Pertanyaan
                    ${currentQuiz + 1}
                    dari
                    ${quizQuestions.length}

                </p>

                <div style="
                    width:100%;
                    height:10px;
                    background:#eee;
                    border-radius:20px;
                    margin-top:15px;
                    overflow:hidden;
                ">

                    <div style="
                        width:${progress}%;
                        height:100%;
                        background:#2563ff;
                    ">

                    </div>

                </div>

            </div>

            <div
            class="option-box"
            style="margin-top:15px;">

                <h3>

                    ${quiz.question}

                </h3>

                <div class="option-buttons">

                    ${optionsHTML}

                </div>

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}

// ================= ANSWER QUIZ =================

function answerQuiz(selected){

    const quiz =
    quizQuestions[currentQuiz];

    quizAnswers.push({
        
        question:
        quiz.question,
        
        userAnswer:
        quiz.options[selected],
        
        correctAnswer:
        quiz.options[quiz.answer],
        
        isCorrect:
        selected === quiz.answer
    });

    addUserMessage(
        quiz.options[selected]
    );

    // ================= CHECK ANSWER =================

    if(selected === quiz.answer){

        score++;

        setTimeout(()=>{

            addBotMessage(
                "Jawaban kamu benar ✅"
            );

        },400);

    }

    else{

        setTimeout(()=>{

            addBotMessage(
                "Jawaban belum tepat 😊"
            );

        },400);

    }

    currentQuiz++;

    // ================= NEXT QUIZ =================

    setTimeout(()=>{

        if(
            currentQuiz
            <
            quizQuestions.length
        ){

            showQuiz();

        }

        else{

            showQuizResult();

        }

    },1000);

}

// ================= QUIZ RESULT =================

function showQuizResult(){

    const percent =
    Math.round(
        (score / quizQuestions.length)
        * 100
    );

    let message = "";

    let actionButtons = "";

    // ================= LULUS =================

    if(percent >= 60){

        saveLearningProgress();

        saveQuizAttempt(
            score,
            quizQuestions.length,
            true
        );

        message =

        "🎉 Selamat!<br><br>" +

        "Kamu telah menyelesaikan " +

        "modul ini dengan baik.";

        actionButtons = `

        <button
        class="option-btn"
        onclick="goToNextModule()">

            Modul Berikutnya

        </button>

        <button
        class="option-btn"
        onclick="startLearning()">

            Pilih Topik Lain

        </button>

        <button
        class="option-btn"
        onclick="startProfiling()">

            Mulai Profiling

        </button>

        `;

    }

    // ================= TIDAK LULUS =================

    else{

        saveQuizAttempt(
            score,
            quizQuestions.length,
            false
        );

        message =

        "😊 Jangan khawatir.<br><br>" +

        "Kamu masih perlu memahami " +

        "materi ini lebih dalam.<br><br>" +

        "Coba pelajari kembali materi " +

        "dan ulangi quiz ya.";

        actionButtons = `

        <button
        class="option-btn"
        onclick="readyQuiz()">

            Ulangi Quiz

        </button>

        <button
        class="option-btn"
        onclick="startLearning()">

            Pilih Topik Lain

        </button>

        `;

    }

    const html = `

    <div class="message">

        <img
        class="avatar"
        src="bot.jpeg">

        <div>

            <div class="bubble">

                <p>

                    🎉 Quiz selesai!

                    <br><br>

                    Skor kamu:

                    <br><br>

                    <span style="
                        font-size:40px;
                        color:#2563ff;
                        font-weight:700;
                    ">

                        ${score}
                        /
                        ${quizQuestions.length}

                    </span>

                    <br><br>

                    ${message}

                </p>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <div class="option-box">

                <h3>
                    Apa yang ingin kamu lakukan?
                </h3>

                <div class="option-buttons">

                    ${actionButtons}

                </div>

            </div>

        </div>

    </div>

    `;

    chatWrapper.innerHTML += html;

    scrollBottom();

}


function goToNextModule(){

    const nextModuleId =
    selectedMaterial.id + 1;

    const nextModule =
    selectedTopic.materials.find(
        m => m.id === nextModuleId
    );

    if(nextModule){

        openModule(
            selectedTopic.id,
            nextModule.id
        );

    }

    else{

        addBotMessage(

            "🎉 Selamat! Kamu sudah menyelesaikan seluruh modul pada topik ini."

        );

    }

}
async function saveLearningProgress(){

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    if(!user || !selectedMaterial){
        return;
    }

    try{

        await fetch(
            "/api/learning-progress",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    userId:user.id,

                    materialName:
                    selectedMaterial.title,

                    status:"completed"

                })

            }
        );

    }

    catch(error){

        console.error(
            "SAVE LEARNING ERROR",
            error
        );

    }

}

async function saveQuizAttempt(
    score,
    totalQuestion,
    passed
){

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    if(!user || !selectedMaterial){
        return;
    }

    try{

        await fetch(
            "/api/quiz-attempt",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    
                    userId:user.id,
                    
                    materialName:
                    selectedMaterial.title,
                    
                    score,
                    
                    totalQuestion,
                    
                    passed,
                    
                    answers:
                    quizAnswers
                })

            }
        );

    }

    catch(error){

        console.error(
            "SAVE QUIZ ERROR",
            error
        );

    }

}

document
.getElementById("messageInput")
.addEventListener(
    "keydown",
    function(event){

        if(event.key === "Enter"){

            event.preventDefault();

            sendMessage();

        }

    }
);