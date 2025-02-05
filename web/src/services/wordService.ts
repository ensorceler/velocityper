export const fetchQuotes = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes`);
  return response.json();
};

export const fetchWords = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/words`);
  return response.json();
};
