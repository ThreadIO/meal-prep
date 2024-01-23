import { NextRequest, NextResponse } from "next/server";
//import { getTaskList } from "@/helpers/thread";

export async function POST(request: NextRequest) {
  console.log("In Get Task List API");
  let data = await request.formData();
  console.log("Data: ", data);
  const jsonResponse = await JSON.parse(bodyContent);
  console.log("Json Response: ", jsonResponse);
  try {
    // let res = await getTaskList(data);
    // if (!res.ok) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: `Server responded with status: ${res.status}`,
    //     },
    //     { status: res.status }
    //   );
    // }

    // const jsonResponse = await res.json();

    return NextResponse.json(
      { success: true, response: jsonResponse },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

let bodyContent = JSON.stringify({
  task_list: [
    {
      count: 6,
      emails: [
        {
          email_thread: [
            {
              message:
                "Hey David! Makes sense. We’re working on a big upgrade to speed this up. Hoping for that to be out in January. Thanks for giving us a shot!\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Sun, Dec 31, 2023 at 3:30 PM",
            },
            {
              message:
                "Initial load was too slow so I got distracted and bounced to something else.",
              sender: "David Melnychuk",
              timestamp: "Tue, Dec 19, 2023 at 12:39 AM",
            },
            {
              message:
                "Hey David Melnychuk!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Tue, Dec 19, 2023 at 12:33 AM",
            },
          ],
          initial_email: {
            message:
              "Hey David Melnychuk!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Re: Why Brev?",
            timestamp: "Tue, Dec 19, 2023 at 12:33 AM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hello!\n\nI didn't finish mostly because I am a student and I have no idea what I am doing, haha. I don't remember that question. I think I realized I was doing the wrong thing for my task, and then closed out of the tab and did something else.",
              sender: "Adria Bower",
              timestamp: "Tuesday, January 16 2024 at 11:10 AM PST",
            },
            {
              message:
                "Hey Adria Bower!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Sat, Jan 13, 2024 at 1:05 AM",
            },
          ],
          initial_email: {
            message:
              "Hey Adria Bower!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Re: Why Brev?",
            timestamp: "Sat, Jan 13, 2024 at 1:05 AM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hey, yeah there wasn’t that many gpu’s available. When I signed up and checked almost every gpu wasn’t available.",
              sender: "ismail yussuf",
              timestamp: "Tuesday, January 16 2024 at 11:45 PM PST",
            },
            {
              message:
                "Hey ismail yussuf!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Mon, Jan 15, 2024 at 5:41 PM",
            },
          ],
          initial_email: {
            message:
              "Hey ismail yussuf!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Re: Why Brev?",
            timestamp: "Mon, Jan 15, 2024 at 5:41 PM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hi Nader teams,\n\nGreeting from Indonesia,\nI am Wury, machine learning researcher from Indonesia\n\nAnyway, thank you for providing us with these amazing tools.\n\nI have a question, how to monitor RAM and CPU usage. some time ago I used NVIDIA T4 (16GiB)1 GPUs x 8 CPUs | 52GiB to train my model. But after 15 hours, the instance suddenly died, I just assumed it was because the RAM or CPU exceeded its limit. It would be very useful, if you also provide a monitoring dashboard for the instance.\n\nBest Regards,\n\nWuriyanto",
              sender: "kata_semangat",
              timestamp: "Wednesday, January 10 2024 at 7:54 PM PST",
            },
            {
              message:
                "Hi kata_semangat,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
              sender: "Nader Khalil",
              timestamp: "Wed, Dec 20, 2023 at 3:04 PM",
            },
          ],
          initial_email: {
            message:
              "Hi kata_semangat,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
            sender: "Nader Khalil",
            subject: "Re: A very automated email 🤙",
            timestamp: "Wed, Dec 20, 2023 at 3:04 PM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hey team! I heard about you on Twitter (Harper).\n\nI'm looking to learn how to fine-tune and ship models. I'm a builder at heart, and a PM by trade. \nCan I pay for 1:1 training to learn how to fine-tune models? It's my January goal 😅",
              sender: "Nick Lebesis",
              timestamp: "Thursday, January 11 2024 at 7:55 AM PST",
            },
            {
              message:
                "Hi Nick Lebesis,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
              sender: "Nader Khalil",
              timestamp: "Thu, Jan 11, 2024 at 10:34 AM",
            },
          ],
          initial_email: {
            message:
              "Hi Nick Lebesis,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
            sender: "Nader Khalil",
            subject: "Re: A very automated email 🤙",
            timestamp: "Thu, Jan 11, 2024 at 10:34 AM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hello,\n\nI am coding a POC for a mental health chatbot and I am looking for some GPU power to have Mistral finetuned to my needs. I happened to find brev Youtube videos which I find very interesting. I will definitely give brev a trial!\n\nAll the best,\n\nPierre-Emmanuel",
              sender: "Pierre-Emmanuel Féga",
              timestamp: "Thursday, January 11 2024 at 4:44 PM PST",
            },
            {
              message:
                "Hi Pierre-Emmanuel FEGA,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
              sender: "Nader Khalil",
              timestamp: "vendredi 12 janvier 2024 01:33",
            },
          ],
          initial_email: {
            message:
              "Hi Pierre-Emmanuel FEGA,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
            sender: "Nader Khalil",
            subject: "RE: A very automated email 🤙",
            timestamp: "vendredi 12 janvier 2024 01:33",
          },
        },
      ],
      task: "Provide assistance and improve the setup process for fine-tuning models.",
    },
    {
      count: 4,
      emails: [
        {
          email_thread: [
            {
              message:
                "Hey Chris! Awesome! Excited for y'all to try it out, let me know if there's anything I can do. Btw we have a big release planned for January including a large supply of much cheaper NVIDIA A100s!",
              sender: "Nader Khalil",
              timestamp: "Saturday, December 23 2023 at 5:58 PM PST",
            },
            {
              message:
                "Nader,\n\nThanks for reaching out.\n\nQuite the opposite, I was impressed by the site.\n\nWe'll probably be trying it in the near future :)\n\nCheers,\nChris Jenkins",
              sender: "Chris Jenkins",
              timestamp: "Sat, Dec 23, 2023 at 12:38 AM",
            },
            {
              message:
                "Hey Chris Jenkins!\n\nI saw you created a Brev account but haven't created anything yet. I'm curious, did you find anything frustrating? Is there anything I can do to help? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Sat, Dec 23, 2023 at 12:47 AM",
            },
          ],
          initial_email: {
            message:
              "Hey Chris Jenkins!\n\nI saw you created a Brev account but haven't created anything yet. I'm curious, did you find anything frustrating? Is there anything I can do to help? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Re: Reaching out from Brev",
            timestamp: "Sat, Dec 23, 2023 at 12:47 AM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hey Paul!\n\nYes this sounds correct! Brev's does 3 things:\nWe connect to many datacenters & clouds to get better pricing and GPU availability\nOur CLI manages the networking, so you don't have to deal with editing your SSH config again, and can access notebooks in the browser\nReliably installs CUDA & python version on your GPU through the UI \n\nBtw we have a big release planned for January including a large supply of much cheaper NVIDIA A100s!",
              sender: "Nader Khalil",
              timestamp: "Saturday, December 23 2023 at 6:01 PM PST",
            },
            {
              message:
                "Hi Nader,\n\nI am just getting my head around the problem you solve. On the surface, you seem to provide a simple way to access deploying AI training work on powerful third-party hosts. Is this correct? We need to do a lot of training for a few tasks on computer vision and some work with LLM fine-tuning. I understand your company's value add.\n\nCheers\n\nPaul",
              sender: "Paul Miller",
              timestamp: "Sat, Dec 23, 2023 at 11:14 AM",
            },
            {
              message:
                "Hey Paul Miller!\n\nI saw you created a Brev account but haven't created anything yet. I'm curious, did you find anything frustrating? Is there anything I can do to help? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Sunday, 24 December 2023 at 7:31 AM",
            },
          ],
          initial_email: {
            message:
              "Hey Paul Miller!\n\nI saw you created a Brev account but haven't created anything yet. I'm curious, did you find anything frustrating? Is there anything I can do to help? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Reaching out from Brev",
            timestamp: "Sunday, 24 December 2023 at 7:31 AM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hey Abraham!\n\nThank you for your message. Wishing you the best for the holidays and hope you enjoy training your model! We have a lot more cooking for January to make it easier to manage cloud costs so you always know what you’re paying for and how to reduce costs.\n\nHave a great holiday season :)\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Sunday, December 24 2023 at 10:38 AM PST",
            },
            {
              message:
                "Hey there! Just a heads-up, I'm currently making sure everything's smooth with my notebook on my local setup before dive in later on Brev, I'm a bit concerned about the costs skyrocketing if I do it all in the cloud, because there's a bit of a tangle with the code. Definitely, my local 3090 GPU might sweat a bit with the Javanese language test training on Mistral 7B.\n\nReally appreciate you reaching out and being active with your customers. Diving into my first cloud GPU experience is thrilling, and I'm eager to get the hang of it! 🤞\n\nAnd oh Happy Holidays to Brev team!\n\nRegards,\nAbraham",
              sender: "Abraham Irawan",
              timestamp: "Sat, Dec 23 2023 at 11:35 PM",
            },
            {
              message:
                "Hey Abraham Irawan!\n\nI saw you created a Brev account but haven't created anything yet. I'm curious, did you find anything frustrating? Is there anything I can do to help? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Sun, Dec 24, 2023, 2:51 AM",
            },
          ],
          initial_email: {
            message:
              "Hey Abraham Irawan!\n\nI saw you created a Brev account but haven't created anything yet. I'm curious, did you find anything frustrating? Is there anything I can do to help? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Re: Reaching out from Brev",
            timestamp: "Sun, Dec 24, 2023, 2:51 AM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hello Nader,\nI created this account cause I might need to test fine-tuning an llm model\n\nRegards \nGeorge Fraiha",
              sender: "George Fraiha",
              timestamp: "Thursday, January 18 2024 at 4:44 AM PST",
            },
            {
              message:
                "Hey George Fraiha!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Thu, Jan 18, 2024, 1:16 PM",
            },
          ],
          initial_email: {
            message:
              "Hey George Fraiha!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Re: Why Brev?",
            timestamp: "Thu, Jan 18, 2024, 1:16 PM",
          },
        },
      ],
      task: "Gather feedback from users on their Brev accounts.",
    },
    {
      count: 2,
      emails: [
        {
          email_thread: [
            {
              message:
                "Hey Nader,\n\nTotally makes sense. I'm interested in GCP primarily because of the compute credit & quota we have there.\n\nLooking forward to an updated flow for GCP!\n\nCheers\nScott",
              sender: "Scott McCrae",
              timestamp: "Friday, October 20 2023 at 11:07 AM PST",
            },
            {
              message:
                "Hey Scott! \n\nThanks for reaching out and sharing this feedback! We had been much more focused on our own compute options, but we're revisiting the flow of adding your own GCP account to make it better. I'll figure out the minimum permission granularity required and update our flow shortly. Please give me ~1 week.\n\nIll reach out once that's finished!\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Fri, Oct 20, 2023 at 6:29 AM",
            },
            {
              message:
                "Hey Nader,\n\nNice to hear from you! I heard about Brev through some of Harper's recent twitter posts (she was also super helpful with a few fine-tuning questions I had!).\n\nI was interested in setting up Brev with our GCP instance tonight, although I wanted to let you know this step in the setup instructions gave me pause:\n\nDoes Brev strictly require owner-level permissions? Would a more restricted service account work? I'm hesitant to create owner-level access keys. \n\nI'd love to try Brev's platform, please let me know if there's a workaround!\n\nCheers,\nScott",
              sender: "Scott McCrae",
              timestamp: "Thu, Oct 19, 2023 at 11:44 PM",
            },
            {
              message:
                "Hi Scott McCrae,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
              sender: "Nader Khalil",
              timestamp: "Thu, Oct 19, 2023 at 9:26 PM",
            },
          ],
          initial_email: {
            message:
              "Hi Scott McCrae,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
            sender: "Nader Khalil",
            subject: "Re: A very automated email 🤙",
            timestamp: "Thu, Oct 19, 2023 at 9:26 PM",
          },
        },
        {
          email_thread: [
            {
              message:
                "Hey Zeke!!\n\nThank you so much for sharing this. Such a bummer of an experience hahaha. We're bringing more A100 capacity online in the next 4-7 days. Ill reach out when that's done :)\n\nWould love to meet up! I swing by the Replicate office quite frequently, or rather I plan to. Heading home for the holidays but Ill be back on the 28th! Wanna meet up in person or do you prefer a call?\n\nP.S. will update the pricing on the blog page!\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Tuesday, November 14 2023 at 2:37 PM PST",
            },
            {
              message:
                "Hey!\n\nZeke from Replicate here. I don't know much about Brev.dev but I keep hearing some interesting things. Would love to meet and chat with you about GPU dev envs, How Colab fits into things, etc.\n\nWanna grab a time to chat? [Calendly Link]\n\nAlso a quick bit of feedback:\n\nThe Replicate prices on this page are now out of date: [Blog Page Link]\n\nI just tried to set up an instance and hit a few hurdles. See screenshot below.\n\nLooking forward to chatting!\n\nZeke",
              sender: "Zeke Sikelianos",
              timestamp: "Tue, Nov 14, 2023 at 2:16 PM",
            },
            {
              message:
                "Hi Zeke Sikelianos,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
              sender: "Nader Khalil",
              timestamp: "Tue, Nov 14, 2023 at 1:52 PM",
            },
          ],
          initial_email: {
            message:
              "Hi Zeke Sikelianos,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
            sender: "Nader Khalil",
            subject: "Re: A very automated email 🤙",
            timestamp: "Tue, Nov 14, 2023 at 1:52 PM",
          },
        },
      ],
      task: "Offer 1:1 training for fine-tuning models.",
    },
    {
      count: 1,
      emails: [
        {
          email_thread: [
            {
              message:
                "Hey Abdelfettah! \n\nWhat difficulties did you find? Did you start from our Llama2 finetune guide? Let me know how to help!\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Tuesday, November 28 2023 at 1:19 PM PST",
            },
            {
              message:
                "Yes, I’m interested in fine-tuning the LLaMA 2 model, but I’ve hit a bit of a roadblock. I created an account on Brev with that goal in mind. However, I encountered some difficulties during the initial setup and wasn’t able to proceed as expected. If you could offer some guidance or support on how to navigate the platform, especially with fine-tuning LLaMA 2, it would be greatly appreciated. Your assistance would be invaluable in helping me move forward with my project",
              sender: "Abdelfettah HOGGUI",
              timestamp: "Mon, Nov 27, 2023 at 6:30 AM",
            },
            {
              message:
                "Hey Abdelfettah HOGGUI!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
              sender: "Nader Khalil",
              timestamp: "Mon, Nov 27, 2023 at 2:56 PM",
            },
          ],
          initial_email: {
            message:
              "Hey Abdelfettah HOGGUI!\n\nI saw you created a Brev account but didn't make it through the initial question asking why you created the account. I'm curious, did you find anything frustrating? Did you get stuck? I'd love any feedback you have— it's super helpful!\n\nI hope to hear from you!\n\n-Nader Khalil | CEO & Co-founder Brev.dev | (415) 237-2247",
            sender: "Nader Khalil",
            subject: "Re: Why Brev?",
            timestamp: "Mon, Nov 27, 2023 at 2:56 PM",
          },
        },
      ],
      task: "Address concerns about costs and improve the cloud GPU experience.",
    },
    {
      count: 1,
      emails: [
        {
          email_thread: [
            {
              message: "Any updates? please look it into it..",
              sender: "Sanjay JR",
              timestamp: "Sunday, January 14 2024 at 4:08 AM PST",
            },
            {
              message: "No problem, thank you!",
              sender: "Sanjay JR",
              timestamp: "Sat, 13 Jan 2024 at 19:41",
            },
            {
              message:
                "Hey Sanjay, will look into this first thing in the morning. Sorry about the delay!\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Sat, 13 Jan 2024 at 09:18",
            },
            {
              message:
                "Hey nader I still haven't received my 20 dollars, please look into it.",
              sender: "Sanjay JR",
              timestamp: "Fri, Jan 12 2024 at 9:16 AM",
            },
            {
              message: "No, it was not. Please refund it Nader, thank you.",
              sender: "Sanjay JR",
              timestamp: "Fri, 29 Dec, 2023, 4:48 pm",
            },
            {
              message:
                "Hey Sanjay! There's a $20 hold that gets placed on the card. It refunds after 7 days. Did it refund? Let me know and I can trigger it to release faster\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Thu, 28 Dec, 2023, 11:41 pm",
            },
            {
              message:
                "please, am from india and this amount is not negligible to me, please I didn't  use any GPU's I was just saving my card.",
              sender: "Sanjay JR",
              timestamp: "Sat, Dec 23, 2023 at 3:16 AM",
            },
            {
              message:
                "My money is my has been debited without doing anything I just gave my card number, please help :/",
              sender: "Sanjay JR",
              timestamp: "Sat, 23 Dec 2023 at 16:13",
            },
            {
              message: "🤙",
              sender: "Sanjay JR",
              timestamp: "Sat, 23 Dec 2023 at 15:30",
            },
            {
              message:
                "Hi Sanjay JR,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
              sender: "Nader Khalil",
              timestamp: "Sat, 23 Dec 2023 at 15:02",
            },
          ],
          initial_email: {
            message:
              "Hi Sanjay JR,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
            sender: "Nader Khalil",
            subject: "Re: A very automated email 🤙",
            timestamp: "Sat, 23 Dec 2023 at 15:02",
          },
        },
      ],
      task: "Provide GPU power for fine-tuning Mistral.",
    },
    {
      count: 1,
      emails: [
        {
          email_thread: [
            {
              message:
                "Hey Skylar! Did you get to the automatic1111 link from the links in the console? Thank you so much for pointing that out! Yes, we changed the way we do templates, actually mirroring Roboflow's impeccable GTM: [GitHub Link]\n\nThere's an automatic1111 template you can use there on your vast.ai instance or if you wish to give Brev another shot.\n\nI put $50 in credits on your account for pointing out the dead urls. Thank you!!\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Wednesday, January 17 2024 at 11:54 AM PST",
            },
            {
              message:
                'Thanks Nader. I originally joined to try out SD on a bigger (more VRAM) GPU than I have in my home machine. Upon joining, there are 3 articles presented, one of which is about deploying SD, but I get an error (looks like Next.js 404) when I click the article. I was asked to upgrade to the new version of Brev UI when logging in but got an error "the selected template requires the old UI" when selecting the Automatic1111 template. Gave up and was able to get Automatic1111 running on vast.ai on my preferred GPU in minutes. Still like the idea behind Brev and I\'d like to try it out sometime.\n\n- Skylar',
              sender: "Skylar Givens",
              timestamp: "Mon, Jan 15, 2024 at 9:05 PM",
            },
            {
              message:
                "Hey Skylar!! Hahaha didn't pay attention to the background, good eye. We love Roboflow.\n\nWe've run into some growth scaling issues which introduced a bunch of instabilities. Sorry if you ran into anything, but we're shipping updates like we're mad making everything way more robust.\n\nPlease let me know if you ran into any difficulties, or if there's ever anything I can do to help :)\n\n-Nader",
              sender: "Nader Khalil",
              timestamp: "Mon, Jan 15, 2024 at 2:00 PM",
            },
            {
              message:
                "Awesome! Love that you kept the Roboflow banner around. I'm at Roboflow and that desk used to be where we worked. With swyx right next door in the enclosed corner office.\n\nExcited to try out Brev!\n\n- Skylar",
              sender: "Skylar Givens",
              timestamp: "Sat, Jan 13, 2024 at 5:41 PM",
            },
            {
              message:
                "Hi Skylar Givens,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
              sender: "Nader Khalil",
              timestamp: "Sat, Jan 13, 2024 at 5:12 PM",
            },
          ],
          initial_email: {
            message:
              "Hi Skylar Givens,\n\nWelcome to Brev!\n\nThis email is automated but we're real humans at your service 👋\n\nIf you need anything, hop in the discord, reply here, or send me a text! (415) 237-2247\n\nBest,\n\nNader\n\nP.S. How'd you hear about us?",
            sender: "Nader Khalil",
            subject: "Re: A very automated email 🤙",
            timestamp: "Sat, Jan 13, 2024 at 5:12 PM",
          },
        },
      ],
      task: "uncategorized",
    },
    {
      count: 0,
      emails: [],
      task: "Plan and execute a big release in January.",
    },
    {
      count: 0,
      emails: [],
      task: "Optimize the initial load time of the website.",
    },
    {
      count: 0,
      emails: [],
      task: "Improve the account setup process for students.",
    },
    {
      count: 0,
      emails: [],
      task: "Ensure availability of GPUs for all users.",
    },
    {
      count: 0,
      emails: [],
      task: "Develop a feature to monitor RAM and CPU usage.",
    },
    {
      count: 0,
      emails: [],
      task: "Provide support and assistance for coding a mental health chatbot.",
    },
    {
      count: 0,
      emails: [],
      task: "Resolve payment issues and provide necessary refunds.",
    },
    {
      count: 0,
      emails: [],
      task: "Revisit the flow for adding GCP accounts and permissions.",
    },
    {
      count: 0,
      emails: [],
      task: "Schedule a meeting with Zeke Sikelianos to discuss GPU dev envs and address dead URLs.",
    },
    {
      count: 0,
      emails: [],
      task: "Improve setup instructions and provide support for users encountering errors and difficulties.",
    },
    {
      count: 0,
      emails: [],
      task: "Credit $50 to Skylar Givens' account for pointing out dead URLs.",
    },
  ],
});
