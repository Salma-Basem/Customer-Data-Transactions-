import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranscationsService {

  
  constructor(private _HttpClient:HttpClient){}

  getTransactionsData():Observable<any>
  {
   return  this._HttpClient.get('https://salma-basem.github.io/host_API/db.json')
  }
}
