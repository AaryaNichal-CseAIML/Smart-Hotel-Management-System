package com.royalhotel.exception

class ResourceNotFoundException(message: String) : RuntimeException(message)

class BusinessException(message: String) : RuntimeException(message)

class UnauthorizedException(message: String) : RuntimeException(message)

class DuplicateResourceException(message: String) : RuntimeException(message)
