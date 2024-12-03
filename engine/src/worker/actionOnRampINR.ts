import { INR_BALANCES } from "../variables";

export function actionOnRampINR(payload: string) {
  const data = JSON.parse(payload);

  const { userId, amount } = data;

  if (!(userId in INR_BALANCES)) {
    const response = { message: "User doesnt exist" };
    return response;
  }

  INR_BALANCES[userId]!.balance += parseInt(amount);

  const response = {
    message: `Onramped ${userId} with amount ${parseInt(amount)}`,
  };

  return response;
}
