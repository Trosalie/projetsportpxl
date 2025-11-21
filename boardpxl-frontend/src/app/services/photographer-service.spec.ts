import { TestBed } from '@angular/core/testing';

import { PhotographService } from './photograph-service';

describe('PhotographService', () => {
  let service: PhotographService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotographService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
