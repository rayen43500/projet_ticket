import { TestBed } from '@angular/core/testing';

import { SubgroupsService } from './subgroups.service';

describe('SubgroupsService', () => {
  let service: SubgroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubgroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
