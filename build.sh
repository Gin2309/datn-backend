export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 22

git pull
npm i
npm run build 
pm2 restart datn-be || pm2 start "npm start"  --name datn-be
