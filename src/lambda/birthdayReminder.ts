import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { birthday } from "../types";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { emailTemplate } from "../utils/emailTemplate";

const { AWS_REGION: region } = process.env;
const sesClient = new SESClient({ region });
const ssmClient = new SSMClient({ region });
let personsToCongratulate = "";

const handler = async () => {
  console.log("Birthday Reminder Lambda!");
  const birthdatyParams = await ssmClient.send(
    new GetParameterCommand({
      Name: "birthdays",
    })
  );
  console.log(birthdatyParams.Parameter?.Value);
  const birthdays: birthday[] = JSON.parse(
    birthdatyParams.Parameter?.Value as string
  );

  birthdays.forEach((person) => {
    const birthdayDate = new Date(person.birthday);

    if (isBirthdayToday(birthdayDate)) {
      addToPersonList(person.name);
    }
  });

  if (personsToCongratulate.length > 0) {
    await sendEmail();
  }
};

const isBirthdayToday = (birthday: Date): boolean => {
  const today = new Date();

  return birthday.getUTCDate() === today.getUTCDate() &&
    birthday.getUTCMonth() === today.getUTCMonth()
    ? true
    : false;
};

const addToPersonList = (name: string) => {
  if (personsToCongratulate.length === 0) {
    personsToCongratulate = personsToCongratulate.concat(name);
  } else {
    personsToCongratulate = personsToCongratulate.concat(`, ${name}`);
  }
};

const sendEmail = async () => {
  try {
    const email = await ssmClient.send(
      new GetParameterCommand({
        Name: "myEmail",
      })
    );
    const repEmail = await ssmClient.send(
      new GetParameterCommand({
        Name: "repEmail",
      })
    );

    console.log(`email from sms ${email.Parameter?.Value}`);
    await sesClient.send(
      new SendEmailCommand({
        Source: repEmail.Parameter?.Value,
        Destination: {
          ToAddresses: [email.Parameter?.Value as string],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: emailTemplate(personsToCongratulate),
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: `🥳 Today is someone Birthday! 🎉`,
          },
        },
      })
    );

    return;
  } catch (error) {
    console.log(error);
    throw new Error("wtf BOOMMM!💣💥💣💥");
  }
};

export { handler };
