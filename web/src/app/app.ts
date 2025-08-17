import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from './services/test';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('web');
  result: any = null;
  error: string = '';

  constructor(private testService: TestService) { }

  ngOnInit() {
    // Auto test เมื่อเริ่มต้น
    this.testHealth();
  }

  testHealth() {
    this.error = '';
    this.result = null;
    
    this.testService.getHealth().subscribe({
      next: (data) => {
        this.result = data;
        console.log('Health check success:', data);
      },
      error: (error) => {
        this.error = `Health check failed: ${error.message}`;
        console.error('Health check error:', error);
      }
    });
  }
}
