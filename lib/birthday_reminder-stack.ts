import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as lambdaNodejs from "@aws-cdk/aws-lambda-nodejs";
import * as targets from "@aws-cdk/aws-events-targets";
import * as iam from "@aws-cdk/aws-iam";

export class BirthdayReminderStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const birthdayReminderLmbda = new lambdaNodejs.NodejsFunction(
      this,
      "birthdayReminderLambda",
      {
        entry: "./src/lambda/birthdayReminder.ts",
      }
    );

    birthdayReminderLmbda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ssm:GetParameter"],
        resources: ["*"],
      })
    );

    new events.Rule(this, "BirthdayReminderTrigger", {
      schedule: events.Schedule.cron({
        hour: "00",
        minute: "00",
      }),
      targets: [new targets.LambdaFunction(birthdayReminderLmbda)],
    });
  }
}
