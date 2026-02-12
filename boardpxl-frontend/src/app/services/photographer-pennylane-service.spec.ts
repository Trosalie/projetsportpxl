import { TestBed } from '@angular/core/testing';

import { PhotographerPennylaneService } from './photographer-pennylane-service';

describe('PhotographerPennylaneService', () => {
  let service: PhotographerPennylaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotographerPennylaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
