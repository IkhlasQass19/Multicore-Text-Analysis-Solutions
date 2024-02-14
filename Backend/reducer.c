#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[1024];
    char current_word[1024] = "";
    int count = 0;

    while (fgets(line, sizeof(line), stdin) != NULL) {
        char word[1024];
        int word_count;

        sscanf(line, "%s\t%d", word, &word_count);

        if (strcmp(word, current_word) == 0) {
            count += word_count;
        } else {
            if (count > 0) {
                printf("%s\t%d\n", current_word, count);
            }
            strcpy(current_word, word);
            count = word_count;
        }
    }

    if (count > 0) {
        printf("%s\t%d\n", current_word, count);
    }

    return 0;
}

