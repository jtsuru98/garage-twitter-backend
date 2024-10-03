import express, { Request, Response } from 'express';
import { exec } from 'child_process';

const app = express();
const port = 3000;


// execute liquibase update command
const runLiquibaseUpdate = (callback: (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => void) => {
  exec('liquibase update', (error, stdout, stderr) => {
    callback(error, stdout, stderr);
  });
};

// endpoint to trigger the liquibase update
// need to make sure the mysql container is running before calling this
app.get('/update-db', (req: Request, res: Response) => {
  runLiquibaseUpdate((error, stdout, stderr) => {
    if (error) {
      console.error(`Error running Liquibase: ${error}`);
      res.status(500).send(`Error running Liquibase: ${stderr}`);
      return;
    }

    res.send(`Liquibase update completed: ${stdout}`);
  });
});

// landing endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('hello world!');
});


// start server with liquibase dependency set up
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);

  // run Liquibase update automatically on server start
  runLiquibaseUpdate((error, stdout, stderr) => {
    if (error) {
      console.error(`Error running Liquibase at startup: ${error}`);
      return;
    }
    console.log(`Liquibase update completed at startup: ${stdout}`);
  });
});