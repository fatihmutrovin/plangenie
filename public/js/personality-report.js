async function loadReport(){

    const user =
    JSON.parse(
        localStorage.getItem(
            "user"
        )
    );

    if(!user){

        window.location.href =
        "login.html";

        return;

    }

    const response =
    await fetch(

        `/api/personality-report/${user.id}`

    );

    const result =
    await response.json();

    if(!result.success){

        alert(
            "Data report tidak ditemukan"
        );

        return;

    }

    const report =
    result.report;

    const recommendations =
    result.recommendations;

    const insights = [];

    if(
        report.saving_rate === "Baik" ||
        report.saving_rate === "Sangat Baik"
    ){

        insights.push(
            "Memiliki kebiasaan menabung yang cukup baik"
        );

    }

    if(
        report.risk_profile === "Moderat"
    ){

        insights.push(
            "Cukup terbuka terhadap peluang investasi"
        );

    }

    if(
        report.financial_condition ===
        "Cukup Stabil"
    ){

        insights.push(
            "Kondisi keuangan relatif terjaga"
        );

    }

    if(
        report.personality ===
        "Saver Splurger"
    ){

        insights.push(
            "Mampu menyeimbangkan kebutuhan dan gaya hidup"
        );

    }

    const descriptions = {

        "Compulsive Spender":
        "Cenderung mengutamakan pengeluaran dibandingkan menabung dan investasi. Membutuhkan kontrol cashflow yang lebih baik.",

        "Compulsive Saver":
        "Sangat disiplin dalam menabung dan memiliki fokus tinggi terhadap keamanan finansial.",

        "Saver Splurger":
        "Mampu menabung namun tetap menikmati gaya hidup tertentu. Memiliki potensi pertumbuhan finansial yang baik.",

        "The Worrier":
        "Sangat berhati-hati terhadap risiko dan cenderung mempertimbangkan berbagai kemungkinan sebelum mengambil keputusan finansial.",

        "Balanced Financial User":
        "Memiliki keseimbangan yang cukup baik antara kebutuhan saat ini dan tujuan finansial masa depan."

    };

    const riskDescriptions = {

        "Konservatif":
        "Cocok untuk instrumen stabil dan berisiko rendah.",

        "Moderat":
        "Cocok untuk kombinasi pertumbuhan dan stabilitas.",

        "Agresif":
        "Cocok untuk investasi jangka panjang dengan potensi pertumbuhan tinggi."

    };

    document
    .getElementById(
        "reportContainer"
    )
    .innerHTML = `

    <div class="summary-grid">

        <div class="summary-card">

            <h4>Saving Rate</h4>

            <h2>
                ${report.saving_rate}
            </h2>

        </div>

        <div class="summary-card">

            <h4>Risk Profile</h4>

            <h2>
                ${report.risk_profile}
            </h2>

        </div>

        <div class="summary-card">

            <h4>Financial Condition</h4>

            <h2>
                ${report.financial_condition}
            </h2>

        </div>

    </div>

    <div class="personality-card">

        <div class="card-title">

            Personality Finansial Kamu

        </div>

        <div style="
        display:flex;
        align-items:center;
        gap:15px;
        ">

            <div style="
            width:70px;
            height:70px;
            border-radius:50%;
            background:#fff2d7;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:34px;
            ">

                ${getEmoji(report.personality)}

            </div>

            <div>

                <h2>

                    ${report.personality}

                </h2>

                <p>

                    ${descriptions[
                        report.personality
                    ]}

                </p>

            </div>

        </div>

    </div>

    <div class="insight-grid">

        <div class="insight-card">

            <div class="card-title">

                Insight Perilaku

            </div>

            ${insights.map(item=>`

                <div class="insight-item">

                    <i class="fa-solid fa-circle-check"></i>

                    ${item}

                </div>

            `).join("")}

        </div>

        <div class="risk-card">

            <div class="card-title">

                Risk Profile

            </div>

            <div class="risk-badge">

                ${report.risk_profile}

            </div>

            <div class="risk-desc">

                ${riskDescriptions[
                    report.risk_profile
                ]}

            </div>

        </div>

    </div>

    <div class="recommendation-card">

        <div class="card-title">

            Rekomendasi Awal

        </div>

        ${recommendations.map(

            (item,index)=>`

            <div class="rec-box">

                <div class="rec-title">

                    Prioritas ${index+1}

                </div>

                <div class="rec-text">

                    ${item}

                </div>

            </div>

        `).join("")}

    </div>

    `;

}

function getEmoji(personality){

    const emojis = {

        "Compulsive Spender":"😅",
        "Compulsive Saver":"💰",
        "Saver Splurger":"🙂",
        "The Worrier":"🤔",
        "Balanced Financial User":"⚖️"

    };

    return emojis[personality] || "🙂";

}

loadReport();