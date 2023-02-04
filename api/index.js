const handler = (req, res) => {
  try {
    res.he
    res.send({
      hello: 'hi world',
    });
  } catch (err) {
    res.send(err) // send the thrown error
  }
};

export default handler;