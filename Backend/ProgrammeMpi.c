#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <mpi.h>

#define MAX_WORD_LENGTH 50 // Longueur maximale d'un mot
#define MAX_WORDS_PER_PROCESS 1000

typedef struct {
    char word[MAX_WORD_LENGTH];
    int count;
} WordCount;

void saveResultsToJson(WordCount *wordCounts, int totalWords, int rank) {
    char filename[100];
    sprintf(filename, "/home/ikhlas/Desktop/MiniProjet/Backend/ResultatMPI/process_%d_occurrence_mpi.json", rank);
    FILE *outputFile = fopen(filename, "w");
    if (outputFile == NULL) {
        printf("Erreur lors de l'ouverture du fichier de sortie.\n");
        return;
    }

    fprintf(outputFile, "{\n");
    fprintf(outputFile, "\"Process %d\": [\n", rank);

    // Écrire les résultats du processus dans le fichier JSON
    for (int i = 0; i < totalWords; ++i) {
        fprintf(outputFile, "{\"%s\": %d}", wordCounts[i].word, wordCounts[i].count);
        if (i < totalWords - 1) {
            fprintf(outputFile, ",\n");
        }
    }

    fprintf(outputFile, "]\n");
    fprintf(outputFile, "}\n");

    fclose(outputFile);
}

int main(int argc, char *argv[]) {
    MPI_Init(&argc, &argv);

    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    FILE *file;
    if (rank == 0) {
        file = fopen("text.txt", "r");
        if (file == NULL) {
            printf("Erreur lors de l'ouverture du fichier.\n");
            MPI_Abort(MPI_COMM_WORLD, 1);
        }
    }

    MPI_Status status;
    char word[MAX_WORD_LENGTH];
    WordCount wordCounts[MAX_WORDS_PER_PROCESS];
    int totalWords = 0;

    while (1) {
        if (rank == 0) {
            // Lecture du fichier par le processus 0 et envoi aux autres processus
            int index = 0;
            while (fscanf(file, "%s", word) == 1) {
                int dest = (index % (size - 1)) + 1;
                MPI_Send(word, MAX_WORD_LENGTH, MPI_CHAR, dest, 0, MPI_COMM_WORLD);
                index++;
            }

            for (int i = 1; i < size; ++i) {
                strcpy(word, "END");
                MPI_Send(word, MAX_WORD_LENGTH, MPI_CHAR, i, 0, MPI_COMM_WORLD);
            }

            fclose(file);
            break;
        } else {
            // Réception des mots et comptage par les autres processus
            MPI_Recv(word, MAX_WORD_LENGTH, MPI_CHAR, 0, 0, MPI_COMM_WORLD, &status);
            if (strcmp(word, "END") == 0) break;

            int len = strlen(word);
            if (len > 0 && (word[len - 1] == ',' || word[len - 1] == '.')) {
                word[len - 1] = '\0';
            }

            int found = 0;
            for (int i = 0; i < totalWords; ++i) {
                if (strcmp(wordCounts[i].word, word) == 0) {
                    wordCounts[i].count++;
                    found = 1;
                    break;
                }
            }

            if (!found) {
                strcpy(wordCounts[totalWords].word, word);
                wordCounts[totalWords].count++;
                totalWords++;
            }
        }
    }

    if (rank != 0) {
        // Envoi des résultats au processus 0
        MPI_Send(&totalWords, 1, MPI_INT, 0, 0, MPI_COMM_WORLD);
        MPI_Send(wordCounts, totalWords * sizeof(WordCount), MPI_CHAR, 0, 0, MPI_COMM_WORLD);

        // Sauvegarde des résultats du processus dans un fichier JSON
        saveResultsToJson(wordCounts, totalWords, rank);
    } else {
        // Réception des résultats des autres processus et combinaison
        WordCount finalCounts[MAX_WORDS_PER_PROCESS * size];
        int finalTotalWords = 0;

        for (int i = 1; i < size; ++i) {
            int processTotalWords;
            MPI_Recv(&processTotalWords, 1, MPI_INT, i, 0, MPI_COMM_WORLD, &status);

            WordCount processCounts[MAX_WORDS_PER_PROCESS];
            MPI_Recv(processCounts, processTotalWords * sizeof(WordCount), MPI_CHAR, i, 0, MPI_COMM_WORLD, &status);

            for (int j = 0; j < processTotalWords; ++j) {
                int k;
                for (k = 0; k < finalTotalWords; ++k) {
                    if (strcmp(finalCounts[k].word, processCounts[j].word) == 0) {
                        finalCounts[k].count += processCounts[j].count;
                        break;
                    }
                }
                if (k == finalTotalWords) {
                    strcpy(finalCounts[k].word, processCounts[j].word);
                    finalCounts[k].count = processCounts[j].count;
                    finalTotalWords++;
                }
            }
        }

        // Affichage et sauvegarde des résultats combinés
        printf("Occurrences de mots :\n");
        for (int i = 0; i < finalTotalWords; ++i) {
            printf("%s : %d\n", finalCounts[i].word, finalCounts[i].count);
        }

        saveResultsToJson(finalCounts, finalTotalWords, rank);
    }

    MPI_Finalize();

    return 0;
}
