import { TestBed } from '@angular/core/testing';

import { PhotographerService } from './photographer-service';

describe('PhotographerService', () => {
  let service: PhotographerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotographerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
