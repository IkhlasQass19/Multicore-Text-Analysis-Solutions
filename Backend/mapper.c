#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[1024];

    while (fgets(line, sizeof(line), stdin) != NULL) {
        char *token = strtok(line, " \t\n");
        while (token != NULL) {
            printf("%s\t1\n", token);
            token = strtok(NULL, " \t\n");
        }
    }

    return 0;
}

