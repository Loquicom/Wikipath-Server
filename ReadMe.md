# Wikipath Server

## Config

 - name : Le nom du serveur
 - lang : La langue du serveur
 - maxPlayer : Nombre de joueur maximum dans la partie
 - firstFinish : Fin de la partie quand le 1er joueur à trouver un chemin, sinon attend que tous les joueurs sauf le dernier ai terminé pour établir un classement
 - destinationInfo : Permet au joueur d'avoir des infos sur la page de destination
 - fullPage : N'est utile que si `destinationInfo` est activé. Permet de voir la page wikipedia entière de l'article de destination, sinon affiche juste un résumé
 - nat : Utilisation du nat en upnp pour rendre le serveur accesible depuis internet et ainsi permettre le jeu en ligne
 - ip : L'ip du serveur. Elle est utilisé uniquement si nat est à false ou si il est impossible de récupérer l'ip exterieur via upnp. Doit être à null si pas set