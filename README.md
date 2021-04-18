# my_cons_elec
##description
est une application qui permet de faire un suivi précis de sa consommation électrique journalière tout simplement en fournissant une valeur de relevé de consommation ainsi que l'heure du relevé l'application se charge du reste (plus vous faite de relevé plus les estimation son précise).
##installation
pour permettre à l'application de fonctionner il faut tout d'abord définir une créer une variable d'environnement nommé "eca_running_env" est lui affecté une valeur (exemple le nom de la machine).

- dans le fichier /config/db.json il va falloir ajouter une ligne qui auras pour clé la valeur de "eca_running_env" et possédera en valeur l'url de connection à la base postgres sous la forme : "postgres://\<dbUser>:\<dbPassword>@<dbIp/dbHostname>:\<dbPort>/\<dbName>"
  

- dans le fichier /config/env.json ici aussi il faudra toujours à l'aide de la valeur de "eca_running_env" créer une entrée en suivant l'exemple fournis dans le fichier.
