const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const port = 3001;

app.use(express.json());
app.use(fileUpload());

app.post('/process', async (req, res) => {
  try {
    const numThreads = req.query.threads;
    const execution = req.query.execution; 
    const text = req.body.text;
    console.log(numThreads);
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Vérification du fichier envoyé
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const uploadedFile = req.files.file;
    const filePath = '/home/ikhlas/Desktop/MiniProjet/Backend/text.txt'; // Chemin où le fichier sera sauvegardé
    console.log("je suis la");
    uploadedFile.mv(filePath, (err) => {
      if (err) {
        console.error('Error saving uploaded file:', err);
        res.status(500).json({ success: false, message: 'Error saving uploaded file.' });
        return;
      }
    /*
      // Lancement du processus
      const process = spawn('./progopenmp', [numThreads]);

      process.on('close', (code) => {
        if (code !== 0) {
          console.error(`Program exited with code ${code}`);
          res.status(500).json({ success: false, message: 'Error processing data.' });
          return;
        }

        // Lecture du fichier de sortie créé par le programme C
        fs.readFile('occurrence.json', 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading occurrence.json:', err);
            res.status(500).json({ success: false, message: 'Error reading occurrence.json.' });
            return;
          }

          const results = JSON.parse(data);
          console.log(results);
          res.json({ success: true, message: 'Processing successful.', results });
        });
      });*/
      let command = '';
      let commandArgs = [];

      if (execution === 'mpi') {
        const resultDir = '/home/ikhlas/Desktop/MiniProjet/Backend/ResultatMPI'; // Directory to save MPI results
        command = 'mpirun';
        commandArgs = ['-np', numThreads, './ProgrammeMpi']; // Modify with your MPI program and arguments

        const process = spawn(command, commandArgs);

       /* process.on('close', (code) => {
          if (code !== 0) {
            console.error(`Program exited with code ${code}`);
            res.status(500).json({ success: false, message: 'Error processing data.' });
            return;
          }

          // Combine results from different files into a single response
          const combinedResults = [];
          fs.readdir(resultDir, (err, files) => {
            if (err) {
              console.error('Error reading directory:', err);
              res.status(500).json({ success: false, message: 'Error reading directory.' });
              return;
            }

            files.forEach((file) => {
              const filePath = path.join(resultDir, file);
              const content = fs.readFileSync(filePath, 'utf-8');
              combinedResults.push({ filename: file, content });
            });
            console.log(combinedResults);
            res.json({ success: true, message: 'Processing successful.', results: combinedResults });
          });
        });

process.on('close', (code) => {
  if (code !== 0) {
    console.error(`Program exited with code ${code}`);
    res.status(500).json({ success: false, message: 'Error processing data.' });
    return;
  }

  const combinedResults = [];
  fs.readdir(resultDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      res.status(500).json({ success: false, message: 'Error reading directory.' });
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(resultDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      combinedResults.push({ filename: file, content });

      // Delete the file after reading
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    });
    console.log(combinedResults);
    res.json({ success: true, message: 'Processing successful.', results: combinedResults });
  });
});*/
process.on('close', (code) => {
  if (code !== 0) {
    console.error(`Program exited with code ${code}`);
    res.status(500).json({ success: false, message: 'Error processing data.' });
    return;
  }

  const combinedContent = {}; // Objets pour combiner les résultats

  fs.readdir(resultDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      res.status(500).json({ success: false, message: 'Error reading directory.' });
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(resultDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Combine the content into a single object
      Object.keys(content).forEach((key) => {
        combinedContent[key] = combinedContent[key] ? combinedContent[key].concat(content[key]) : content[key];
      });

      // Delete the file after reading
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    });
    console.log(combinedContent);
    res.json({ results: combinedContent });
  });
});
      } else if (execution === 'openmp')   {
        /*res.status(400).json({ success: false, message: 'Invalid execution type.' });
        return;*/
        const process = spawn('./progopenmp', [numThreads]);

        process.on('close', (code) => {
          if (code !== 0) {
            console.error(`Program exited with code ${code}`);
            res.status(500).json({ success: false, message: 'Error processing data.' });
            return;
          }
  
          // Lecture du fichier de sortie créé par le programme C
          fs.readFile('occurrence.json', 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading occurrence.json:', err);
              res.status(500).json({ success: false, message: 'Error reading occurrence.json.' });
              return;
            }
  
            const results = JSON.parse(data);
            console.log(results);
            res.json({ success: true, message: 'Processing successful.', results });
          });
        });
      }
   /*   else{
        console.log("c'est pour hadop");
        const hadoopProcess = spawn('bash', ['execute_hadoop.sh']);

    hadoopProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    hadoopProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    hadoopProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Hadoop script exited with code ${code}`);
        res.status(500).json({ success: false, message: 'Error executing Hadoop script.' });
        return;
      }

     
// Lire le contenu du fichier texte
fs.readFile('/home/ikhlas/Desktop/MiniProjet/Backend/output.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier :', err);
    return;
  }

  // Diviser le contenu par lignes
  const lines = data.trim().split('\n');

  // Convertir chaque ligne en un objet JSON
  const wordCount = lines.map(line => {
    const [word, count] = line.trim().split('\t');
    return { "word": word, "count": parseInt(count) };
  });

  // Créer l'objet JSON final
  const finalJSON = { "word_count": wordCount };

  // Écrire l'objet JSON dans un fichier
  fs.writeFile('output.json', JSON.stringify(finalJSON, null, 2), (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture du fichier JSON :', err);
      return;
    }
    console.log('Le fichier JSON a été généré avec succès.');
  });
});
 })
      }*/
      else {
        console.log("C'est pour Hadoop");
        const hadoopProcess = spawn('bash', ['execute_hadoop.sh']);
      
        hadoopProcess.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });
      
        hadoopProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });
      
        hadoopProcess.on('close', (code) => {
          if (code !== 0) {
            console.error(`Hadoop script exited with code ${code}`);
            res.status(500).json({ success: false, message: 'Error executing Hadoop script.' });
            return;
          }
      
          fs.readFile('/home/ikhlas/Desktop/MiniProjet/Backend/output.txt', 'utf8', (err, data) => {
            if (err) {
              console.error('Erreur lors de la lecture du fichier :', err);
              res.status(500).json({ success: false, message: 'Error reading file.' });
              return;
            }
      
            const lines = data.trim().split('\n');
            const wordCount = lines.map(line => {
              const [word, count] = line.trim().split('\t');
              return { "word": word, "count": parseInt(count) };
            });
      
            const finalJSON = { "word_count": wordCount };
            console.log(finalJSON);
            // Envoyer la réponse JSON directement à la demande React
            res.status(200).json(finalJSON);
          });
        });
      }
      
    });
  } catch (error) {
    console.error('Error in server processing:', error);
    res.status(500).json({ success: false, message: 'Error in server processing.' });
  }
});
    
app.options('/process', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
