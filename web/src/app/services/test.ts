import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ← ต้อง import HttpClient
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // ← Import environment

@Injectable({
  providedIn: 'root'
})
export class TestService { // ← เปลี่ยนชื่อเป็น TestService (ใส่ Service ต่อท้าย)
  private apiUrl = environment.apiUrl; // ← ใช้จาก environment

  constructor(private http: HttpClient) { }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  // เพิ่ม methods อื่นๆ ตามต้องการ
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }
}