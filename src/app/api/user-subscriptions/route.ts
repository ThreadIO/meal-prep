import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const userData = await request.json();

  // Fetch user's subscriptions from your database or another API
  const subscriptions = await fetchUserSubscriptions(userData.user_id);

  let subscriptionHtml = "";
  subscriptions.forEach((sub) => {
    subscriptionHtml += `
      <div class="subscription-card">
        <div class="subscription-details">
          <h3>${sub.name}</h3>
          <p>Next delivery: ${sub.nextDelivery}</p>
          ${sub.details.map((detail) => `<p>${detail}</p>`).join("")}
        </div>
        <div>
          <div class="subscription-status status-${sub.status}">${sub.status}</div>
          <button class="manage-button">Manage</button>
        </div>
      </div>
    `;
  });

  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My Subscriptions</title>
      <style>
          .subscription-container {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
          }
          .subscription-card {
              background-color: #f9f9f9;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              margin-bottom: 20px;
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
          }
          .subscription-details h3 {
              margin: 0 0 10px 0;
              color: #333;
          }
          .subscription-details p {
              margin: 5px 0;
              color: #666;
          }
          .subscription-status {
              font-weight: bold;
              padding: 5px 10px;
              border-radius: 20px;
              text-align: center;
          }
          .status-active {
              background-color: #e6f7e6;
              color: #2e7d32;
          }
          .status-paused {
              background-color: #fff9c4;
              color: #f57f17;
          }
          .manage-button {
              background-color: #4CAF50;
              color: white;
              border: none;
              padding: 10px 20px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
          }
      </style>
  </head>
  <body>
    <div class="subscription-container">
      ${subscriptionHtml}
    </div>
  </body>
  </html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}

// Placeholder function - you need to implement this
async function fetchUserSubscriptions(userId: any) {
  // This should fetch the user's subscriptions from your database or another API
  // For now, we'll return some dummy data
  console.log("Test user subscriptions: ", userId);
  return [
    {
      name: "Weekly Meal Plan",
      nextDelivery: "May 15, 2024",
      details: ["Meals per week: 3", "Servings per meal: 2"],
      status: "active",
    },
    {
      name: "Monthly Snack Box",
      nextDelivery: "June 1, 2024",
      details: ["Box size: Medium"],
      status: "paused",
    },
  ];
}
