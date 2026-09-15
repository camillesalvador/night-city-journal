import {defineConfig} from 'vite';
export default defineConfig({server:{host:'127.0.0.1',port:5174,strictPort:true,watch:{ignored:['**/data/**']},fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/data/**']}},preview:{host:'127.0.0.1',port:4174,strictPort:true}});
