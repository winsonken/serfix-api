const post = async () => {
  try {
    const response = await fetch('http://192.168.100.7:8082/user');
    const data = await response.json();
    console.log(data); // Log the fetched data to the console
    return data;
  } catch (error) {
    console.log(error);
 }
};

post(); // Invoke the post function
