import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestService } from './test';


describe('TestService', () => {
  let service: TestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestService,
        provideHttpClient(withFetch()),   // 👈 ใช้ HttpClient จริง
        provideHttpClientTesting(),       // 👈 mock backend สำหรับเทส
      ],
    });

    service = TestBed.inject(TestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
