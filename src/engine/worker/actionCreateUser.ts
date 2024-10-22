import { INR_BALANCES, STOCK_BALANCES } from "../variables";

// TODO: can laterOn handle the params gracefully with typescript
export function actionCreateUser(payload: string) {
  const data = JSON.parse(payload);

  const { userId } = data;

  // TODO: take care of status codes laterOn -> just add a status in response
  // OR INFACT TAKE an early exits in the ROUTES themselves -> simple
  // TODO: do sanitization in routes

  if (!userId) {
    const response = { messsage: "Please enter the userId" };
    return response;
  }

  if (userId in INR_BALANCES) {
    const response = { message: "User Alerady Exists" };
    return response;
  }

  INR_BALANCES[userId] = {
    balance: 0,
    locked: 0,
  };

  STOCK_BALANCES[userId] = {};

  const response = { message: "User Created Successfully" };
  return response;
}
