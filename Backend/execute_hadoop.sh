#!/bin/bash
export HADOOP_HOME=/"/home/ikhlas/hadoop-3.3.6"
export PATH="$PATH:$HADOOP_HOME/bin"

hadoop fs -put text.txt /user/ikhlas
# Exécution de Hadoop Streaming avec les programmes C
$HADOOP_HOME/bin/hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
    -input text.txt \
    -output wordcount_output \
    -mapper mapper \
    -reducer reducer \
    -file mapper \
    -file reducer

# Récupération de la sortie de Hadoop
hdfs dfs -cat wordcount_output/part-* > output.txt

# Suppression du répertoire de sortie 
hdfs dfs -rm -r wordcount_output
#supperession dunfichier
hadoop fs -rm /user/ikhlas/text.txt
